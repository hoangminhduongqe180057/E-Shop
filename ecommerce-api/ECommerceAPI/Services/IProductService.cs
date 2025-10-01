using ECommerceAPI.DTOs;

namespace ECommerceAPI.Services
{
    public interface IProductService
    {
        Task<List<ProductReadDto>> GetAllAsync();
        Task<ProductReadDto?> GetByIdAsync(Guid id);
        Task<ProductReadDto> CreateAsync(ProductActionDto dto);
        Task<ProductReadDto?> UpdateAsync(Guid id, ProductActionDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}