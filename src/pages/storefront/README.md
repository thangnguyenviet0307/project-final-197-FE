# Trang bán hàng

Các trang storefront hiện có:

- `home/index.tsx`: homepage theo thứ tự hero, danh mục nhanh, tiện ích, bộ sưu tập,
  tab ưu đãi/bán chạy/đánh giá, ba nhóm sản phẩm và testimonial.
- `products/index.tsx`: danh sách sản phẩm và bộ lọc.
- `products/detail.tsx`: chi tiết, gallery, chọn biến thể, tab nội dung và sản phẩm liên quan.

Các trang dùng `src/features/storefront/` cho dữ liệu demo và component nghiệp vụ,
được bọc bởi `src/layout/storefront/`. Xem [quy tắc tổ chức Frontend](../../../docs/frontend-structure.md).

Catalog hiện dùng dữ liệu demo vì Backend chưa có API catalog công khai.
Giỏ hàng/checkout và luồng đặt hàng chưa được bật. Xem
[giới hạn storefront hiện tại](../../../docs/storefront-contract.md).
