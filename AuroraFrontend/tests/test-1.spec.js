import { test, expect } from '@playwright/test';
test.describe.configure({ mode: 'serial' });

test.describe('Setup', () => {
  let testEmail1;
  let testEmail2;
  let authToken1;
  let authToken2;
  let groupId;
  test.beforeEach(() => {
    testEmail1= `testaurora123.app+${Date.now()}@gmail.com`;
    testEmail2=  `testaurora123.app+${Date.now()+ 1}@gmail.com`;
  });

  test('Aurora Flow', async ({ page }) => {
    // Register first account
    await page.goto('https://localhost:5173/Registration');
    await page.fill('input[name="nickname"]', 'TestUser');
    await page.fill('input[name="email"]', testEmail1);
    await page.fill('input[name="password"]', 'Parola123!');

    await Promise.all([
      page.waitForResponse(res => 
        res.url().includes('/api/Auth/register') && 
        res.status() === 200
      ),
      page.click('button:has-text("Create account")')
    ]);
    await page.waitForTimeout(1000);

    // Login first acocunt
    await page.goto('https://localhost:5173');
    await page.click('button.login-button');
    const modal = page.locator('.modal');
    await modal.waitFor({ state: 'visible' });

    //Fill in the login form
    await modal.locator('input[name="email"]').fill(testEmail1);
    await modal.locator('input[name="password"]').fill('Parola123!');
    const loginResponsePromise = page.waitForResponse(response => {
      return response.url().includes('/login') && 
            (response.status() === 200 || response.status() === 401);
    });
    await modal.locator('button[type="submit"]').click();
    const loginResponse = await loginResponsePromise;

    // Handle response
    const responseBody = await loginResponse.json();
    console.log('Login response:', responseBody);

    if (loginResponse.status() === 401) {
      throw new Error(`Login failed: ${responseBody.detail || 'Invalid credentials'}`);
    }
    await expect(modal).toBeHidden({ timeout: 5000 });
    authToken1= responseBody.accessToken;
    console.log('Current cookies:', authToken1);
    await page.waitForTimeout(1000);

    // Create Group
    await page.goto('https://localhost:5173/Group/Create');
    await page.fill('input[name= "groupName"]', `Test Group ${testEmail1}`);
    await page.fill('textarea[name= "groupDescription"]', `This is a testing description for the Test Group ${testEmail1}!`)
    await Promise.all([
      page.waitForResponse(res => 
        res.url().includes('/api/Groups/newGroup') && 
        res.status() === 200
      ),
      page.click('button:has-text("Create group")')
    ]);
    await page.waitForTimeout(1000);

    // Logout
    await page.locator('img[alt= "Profile Picture"]').click();
    await page.waitForSelector('button:has-text("Logout")', { state: 'visible' });
    await page.click('button:has-text("Logout")');
    await page.waitForSelector('button.login-button', { state: 'visible' });

    // Register second account
    await page.goto('https://localhost:5173/Registration');
    await page.fill('input[name="nickname"]', 'TestUser');
    await page.fill('input[name="email"]', testEmail2);
    await page.fill('input[name="password"]', 'Parola123!');

    await Promise.all([
      page.waitForResponse(res => 
        res.url().includes('/api/Auth/register') && 
        res.status() === 200
      ),
      page.click('button:has-text("Create account")')
    ]);
    await page.waitForTimeout(1000);

    // Login second acocunt
    await page.goto('https://localhost:5173');
    await page.click('button.login-button');
    const mod = page.locator('.modal');
    await mod.waitFor({ state: 'visible' });

    //Fill in the login form
    await mod.locator('input[name="email"]').fill(testEmail2);
    await mod.locator('input[name="password"]').fill('Parola123!');
    const loginResponseProm = page.waitForResponse(response => {
      return response.url().includes('/login') && 
            (response.status() === 200 || response.status() === 401);
    });
    await mod.locator('button[type="submit"]').click();
    const loginResp = await loginResponseProm;

    // Handle response
    const responseB = await loginResp.json();
    console.log('Login response:', responseB);

    if (loginResp.status() === 401) {
      throw new Error(`Login failed: ${responseB.detail || 'Invalid credentials'}`);
    }
    await expect(mod).toBeHidden({ timeout: 5000 });
    authToken2= responseB.accessToken;
    console.log('Current cookies:', authToken2);
    await page.waitForTimeout(1000);

    // Joining Group
    await page.goto('https://localhost:5173');
    await page.locator(`div.group:has(p.group-name:has-text("Test Group ${testEmail1}"))`).click();
    await page.locator('button.join-button').click();
    await page.waitForTimeout(1000);
    
    // Entering Group Menu
    await page.goto('https://localhost:5173');
    await page.locator(`.sidebar-list a >> text=Test Group ${testEmail1}`).first().click();
    await page.waitForURL(/\/Group\/Menu/);
    const urlShow = page.url();
    const urlPartsShow = urlShow.split('/');
    groupId = urlPartsShow[urlPartsShow.length - 1];
    await page.waitForTimeout(1000);
    
    // Create Event
    await page.goto(`https://localhost:5173/Event/Create/${groupId}`);
    await page.fill('input[name= "title"]', 'Test Event');
    await page.fill('textarea[name= "description"]', 'The most unique testing experience ever!')
    await page.fill('input[name= "color"]', '#0000ff');
    await page.fill('input[name= "date"]', '2025-06-30T09:00');
    await Promise.all([
      page.waitForResponse(res => 
        res.url().includes('/api/events/new') && 
        res.status() === 200
      ),
      page.click('button:has-text("Create event")')
    ]);
    await page.waitForTimeout(1000);

    // Delete second account
    const deleteRes = await page.request.delete(
      'https://localhost:7242/api/ApplicationUsers/delete-account',
      {
        headers: {
          'Authorization': `Bearer ${authToken2}`,
          'Content-Type': 'application/json'
        },
      }
    );
    await expect(deleteRes).toBeOK();
    console.log('Account deleted successfully');
    await page.waitForTimeout(1000);

    // Logout
    await page.goto('https://localhost:5173');
    await page.locator('img[alt= "Profile Picture"]').click();
    await page.waitForSelector('button:has-text("Logout")', { state: 'visible' });
    await page.click('button:has-text("Logout")');
    await page.waitForSelector('button.login-button', { state: 'visible' });

     // Login first account
     await page.goto('https://localhost:5173');
    await page.click('button.login-button');
    const mo = page.locator('.modal');
    await mo.waitFor({ state: 'visible' });

    //Fill in the login form
    await mo.locator('input[name="email"]').fill(testEmail1);
    await mo.locator('input[name="password"]').fill('Parola123!');
    const loginResponsePr = page.waitForResponse(response => {
      return response.url().includes('/login') && 
            (response.status() === 200 || response.status() === 401);
    });
    await mo.locator('button[type="submit"]').click();
    const loginR = await loginResponsePr;

    // Handle response
    const responseBo = await loginR.json();
    console.log('Login response:', responseBo);

    if (loginR.status() === 401) {
      throw new Error(`Login failed: ${responseBo.detail || 'Invalid credentials'}`);
    }
    await expect(mo).toBeHidden({ timeout: 5000 });
    authToken1= responseBo.accessToken;
    console.log('Current cookies:', authToken1);
    await page.waitForTimeout(1000);

    // Delete Group
    await page.locator(`.sidebar-list a >> text=Test Group ${testEmail1}`).first().click();
    await page.waitForURL(/\/Group\/Menu/);
    const url = page.url();
    const urlParts = url.split('/');
    groupId = urlParts[urlParts.length - 1];
    console.log('Group ID:', groupId);
    await page.goto(`https://localhost:5173/Group/Edit?id=${groupId}`);
    await page.click('button:has-text("Delete the group")');
    await page.waitForTimeout(1000);

    // Delete account
    const deleteResponse = await page.request.delete(
      'https://localhost:7242/api/ApplicationUsers/delete-account',
      {
        headers: {
          'Authorization': `Bearer ${authToken1}`,
          'Content-Type': 'application/json'
        },
      }
    );
    await expect(deleteResponse).toBeOK();
    console.log('Account deleted successfully');
  });
});