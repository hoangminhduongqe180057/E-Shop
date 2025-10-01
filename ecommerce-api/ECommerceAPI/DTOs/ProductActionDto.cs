using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.DTOs
{
    public class ProductActionDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = null!;

        [Required, MaxLength(2000)]
        public string Description { get; set; } = null!;

        [Required]
        [Range(0, 9999999.99)]
        public decimal Price { get; set; }
        public IFormFile? File { get; set; }
    }
}