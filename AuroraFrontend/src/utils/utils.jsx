const fetchCategories = async () => {
        try {
            const response = await fetch('https://localhost:7242/api/Categories/index', {
                method: 'Get',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const json = await response.json();
            return json;
        } 
        catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }

      };
export default fetchCategories;