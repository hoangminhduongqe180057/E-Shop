using ECommerceAPI.DTOs;
using ECommerceAPI.Models;
using ECommerceAPI.Repositories;

namespace ECommerceAPI.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;
        private readonly CloudinaryService _cloudinary;

        public ProductService(IProductRepository repo, CloudinaryService cloudinary)
        {
            _repo = repo;
            _cloudinary = cloudinary;
        }

        public async Task<List<ProductReadDto>> GetAllAsync()
        {
            var items = await _repo.GetAllAsync();
            var dtos = items.Select(MapToRead).ToList();
            return dtos;
        }

        public async Task<ProductReadDto?> GetByIdAsync(Guid id)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p == null) return null;
            return MapToRead(p);
        }

        public async Task<ProductReadDto> CreateAsync(ProductActionDto dto)
        {
            string? imageUrl = null;
            if (dto.File != null)
            {
                imageUrl = await _cloudinary.UploadImageAsync(dto.File);
            }

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                ImageUrl = imageUrl
            };

            await _repo.CreateAsync(product);
            return MapToRead(product);
        }

        public async Task<ProductReadDto?> UpdateAsync(Guid id, ProductActionDto dto)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p == null) return null;

            p.Name = dto.Name;
            p.Description = dto.Description;
            p.Price = dto.Price;

            if (dto.File != null)
            {
                p.ImageUrl = await _cloudinary.UploadImageAsync(dto.File);
            }

            p.UpdatedAt = DateTime.UtcNow;
            await _repo.UpdateAsync(p);
            return MapToRead(p);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p == null) return false;
            await _repo.DeleteAsync(p);
            return true;
        }

        private static ProductReadDto MapToRead(Product p) =>
            new ProductReadDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            };
    }
}