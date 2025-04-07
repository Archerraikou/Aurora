using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aurora.Migrations
{
    /// <inheritdoc />
    public partial class Test2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Alias",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Desc",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Nume",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ProfPic",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Alias",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Desc",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nume",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProfPic",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }
    }
}
