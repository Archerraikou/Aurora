using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aurora.Migrations
{
    /// <inheritdoc />
    public partial class Final3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CategoryUsers_AspNetUsers_UserId1",
                schema: "identity",
                table: "CategoryUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_AspNetUsers_UserId1",
                schema: "identity",
                table: "Groups");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_AspNetUsers_UserId1",
                schema: "identity",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_AspNetUsers_UserId1",
                schema: "identity",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_UserGroups_AspNetUsers_UserId1",
                schema: "identity",
                table: "UserGroups");

            migrationBuilder.DropIndex(
                name: "IX_UserGroups_UserId1",
                schema: "identity",
                table: "UserGroups");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId1",
                schema: "identity",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Messages_UserId1",
                schema: "identity",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Groups_UserId1",
                schema: "identity",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_CategoryUsers_UserId1",
                schema: "identity",
                table: "CategoryUsers");

            migrationBuilder.DropColumn(
                name: "UserId1",
                schema: "identity",
                table: "UserGroups");

            migrationBuilder.DropColumn(
                name: "UserId1",
                schema: "identity",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "UserId1",
                schema: "identity",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "UserId1",
                schema: "identity",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "UserId1",
                schema: "identity",
                table: "CategoryUsers");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "identity",
                table: "UserGroups",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "User2",
                schema: "identity",
                table: "PrivateConversations",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "User1",
                schema: "identity",
                table: "PrivateConversations",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "identity",
                table: "Notifications",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "identity",
                table: "Messages",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "identity",
                table: "Groups",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "identity",
                table: "CategoryUsers",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_UserId",
                schema: "identity",
                table: "UserGroups",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                schema: "identity",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_UserId",
                schema: "identity",
                table: "Messages",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_UserId",
                schema: "identity",
                table: "Groups",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CategoryUsers_UserId",
                schema: "identity",
                table: "CategoryUsers",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CategoryUsers_AspNetUsers_UserId",
                schema: "identity",
                table: "CategoryUsers",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_AspNetUsers_UserId",
                schema: "identity",
                table: "Groups",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_AspNetUsers_UserId",
                schema: "identity",
                table: "Messages",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_AspNetUsers_UserId",
                schema: "identity",
                table: "Notifications",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserGroups_AspNetUsers_UserId",
                schema: "identity",
                table: "UserGroups",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CategoryUsers_AspNetUsers_UserId",
                schema: "identity",
                table: "CategoryUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_AspNetUsers_UserId",
                schema: "identity",
                table: "Groups");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_AspNetUsers_UserId",
                schema: "identity",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_AspNetUsers_UserId",
                schema: "identity",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_UserGroups_AspNetUsers_UserId",
                schema: "identity",
                table: "UserGroups");

            migrationBuilder.DropIndex(
                name: "IX_UserGroups_UserId",
                schema: "identity",
                table: "UserGroups");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId",
                schema: "identity",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Messages_UserId",
                schema: "identity",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Groups_UserId",
                schema: "identity",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_CategoryUsers_UserId",
                schema: "identity",
                table: "CategoryUsers");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "identity",
                table: "UserGroups",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                schema: "identity",
                table: "UserGroups",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "User2",
                schema: "identity",
                table: "PrivateConversations",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "User1",
                schema: "identity",
                table: "PrivateConversations",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "identity",
                table: "Notifications",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                schema: "identity",
                table: "Notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "identity",
                table: "Messages",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                schema: "identity",
                table: "Messages",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "identity",
                table: "Groups",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                schema: "identity",
                table: "Groups",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "identity",
                table: "CategoryUsers",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                schema: "identity",
                table: "CategoryUsers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_UserId1",
                schema: "identity",
                table: "UserGroups",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId1",
                schema: "identity",
                table: "Notifications",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_UserId1",
                schema: "identity",
                table: "Messages",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_UserId1",
                schema: "identity",
                table: "Groups",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_CategoryUsers_UserId1",
                schema: "identity",
                table: "CategoryUsers",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_CategoryUsers_AspNetUsers_UserId1",
                schema: "identity",
                table: "CategoryUsers",
                column: "UserId1",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_AspNetUsers_UserId1",
                schema: "identity",
                table: "Groups",
                column: "UserId1",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_AspNetUsers_UserId1",
                schema: "identity",
                table: "Messages",
                column: "UserId1",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_AspNetUsers_UserId1",
                schema: "identity",
                table: "Notifications",
                column: "UserId1",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserGroups_AspNetUsers_UserId1",
                schema: "identity",
                table: "UserGroups",
                column: "UserId1",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
