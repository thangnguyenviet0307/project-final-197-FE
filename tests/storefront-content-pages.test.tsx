import { afterEach, beforeEach, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { MemoryRouter } from 'react-router-dom';

import StorefrontAboutPage from '@/pages/storefront/about';
import StorefrontFAQPage from '@/pages/storefront/faq';
import { authApi } from '@/services/api';
import type {
  AboutPageContent,
  FAQPageContent,
} from '@/features/storefront/types/page-content';

const aboutContent: AboutPageContent = {
  eyebrow: 'VỀ DEMOSTORE',
  title: 'Khám phá công nghệ,',
  highlight: 'theo cách thật dễ dàng.',
  intro:
    'DemoStore giúp bạn khám phá sản phẩm, bài viết và thông tin công nghệ.',
  story: {
    eyebrow: 'CÂU CHUYỆN CỦA CHÚNG TÔI',
    title: 'Thông tin rõ ràng.',
    paragraphs: [
      'Tìm hiểu phụ kiện và thiết bị công nghệ.',
      'Đọc bài viết và tham khảo đánh giá.',
      'Đặt hàng, thanh toán và gửi lời nhắn chưa khả dụng.',
    ],
  },
  offerings: [
    { title: 'Danh mục sản phẩm', description: 'Tìm theo danh mục.' },
  ],
  principles: [{ title: 'Minh bạch', description: 'Thông tin rõ ràng.' }],
  steps: [{ title: 'Tìm sản phẩm', description: 'Dùng ô tìm kiếm.' }],
  notice: {
    title: 'Lưu ý về phạm vi dịch vụ',
    description:
      'Đặt hàng, thanh toán và gửi lời nhắn từ biểu mẫu liên hệ chưa khả dụng.',
  },
};

const faqContent: FAQPageContent = {
  eyebrow: 'HỖ TRỢ DEMOSTORE',
  title: 'Câu hỏi thường gặp',
  intro: 'Tìm câu trả lời về website.',
  categories: [
    {
      id: 'shopping',
      label: 'Sản phẩm',
      title: 'Tìm kiếm và xem sản phẩm',
      questions: [
        {
          id: 'contact-form',
          question: 'Tôi có thể gửi câu hỏi qua trang Liên hệ không?',
          answer: 'Biểu mẫu chưa gửi thông tin. nhập lời nhắn',
        },
      ],
    },
    {
      id: 'orders',
      label: 'Đặt hàng',
      title: 'Đặt hàng và thanh toán',
      questions: [
        {
          id: 'checkout',
          question: 'Tôi có thể đặt hàng không?',
          answer: 'Checkout chưa được triển khai.',
        },
      ],
    },
  ],
};

const originalAdapter = authApi.defaults.adapter;
const requests: string[] = [];
let client: QueryClient;
let failAboutRequest = false;

beforeEach(() => {
  requests.length = 0;
  failAboutRequest = false;
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  authApi.defaults.adapter = async (config) => {
    const url = config.url ?? '';
    requests.push(url);

    if (failAboutRequest && url.endsWith('/storefront/pages/about')) {
      throw new AxiosError('API unavailable');
    }

    const data = url.endsWith('/storefront/pages/about')
      ? aboutContent
      : faqContent;
    return {
      config,
      data: { success: true, statusCode: 200, message: 'Success', data },
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
    };
  };
});

afterEach(() => {
  authApi.defaults.adapter = originalAdapter;
  client.clear();
});

function renderPage(page: React.ReactNode) {
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{page}</MemoryRouter>
    </QueryClientProvider>
  );
}

it('loads and renders the introduction page from the public content API', async () => {
  renderPage(<StorefrontAboutPage />);

  expect(
    await screen.findByRole('heading', { name: /Khám phá công nghệ/ })
  ).toBeTruthy();
  expect(
    screen.getByText(/Đặt hàng, thanh toán và gửi lời nhắn từ biểu mẫu/i)
  ).toBeTruthy();
  expect(
    screen.getByRole('link', { name: /Khám phá sản phẩm/ }).getAttribute('href')
  ).toBe('/shop');
  expect(requests).toEqual(['/storefront/pages/about']);
});

it('loads FAQ from the API and filters by answer text and topic', async () => {
  renderPage(<StorefrontFAQPage />);

  expect(
    await screen.findByRole('heading', { name: 'Câu hỏi thường gặp' })
  ).toBeTruthy();
  expect(requests).toEqual(['/storefront/pages/faq']);

  fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm câu hỏi' }), {
    target: { value: 'nhập lời nhắn' },
  });
  expect(
    screen.getByText('Tôi có thể gửi câu hỏi qua trang Liên hệ không?')
  ).toBeTruthy();

  fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm câu hỏi' }), {
    target: { value: '' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sản phẩm' }));

  expect(
    screen.getByRole('heading', { name: 'Tìm kiếm và xem sản phẩm' })
  ).toBeTruthy();
  expect(
    screen.queryByRole('heading', { name: 'Đặt hàng và thanh toán' })
  ).toBeNull();
});

it('shows an API error and lets visitors retry loading the about page', async () => {
  failAboutRequest = true;
  renderPage(<StorefrontAboutPage />);

  expect(await screen.findByRole('alert')).toBeTruthy();
  failAboutRequest = false;
  fireEvent.click(screen.getByRole('button', { name: 'Thử tải lại' }));

  await waitFor(() =>
    expect(
      screen.getByRole('heading', { name: /Khám phá công nghệ/ })
    ).toBeTruthy()
  );
  expect(requests).toHaveLength(2);
});
