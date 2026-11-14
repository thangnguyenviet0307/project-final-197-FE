import axios from 'axios';
import { ZodError } from 'zod';
import type { ApiError } from '@/types/api';

const localizedMessages: Array<[RegExp, string]> = [
  [
    new RegExp(
      '^Embedding\\ model,\\ provider\\ and\\ dimensions\\ do\\ not\\ match$',
      'i'
    ),
    'Model embedding, nhà cung cấp và số chiều vector không tương thích.',
  ],
  [
    new RegExp(
      '^Enable\\ the\\ AI\\ assistant\\ before\\ starting\\ synchronization$',
      'i'
    ),
    'Vui lòng bật trợ lý AI trước khi bắt đầu đồng bộ kiến thức.',
  ],
  [
    new RegExp(
      '^Configure\\ the\\ selected\\ embedding\\ provider\\ on\\ the\\ server$',
      'i'
    ),
    'Vui lòng cấu hình khóa API của nhà cung cấp embedding đã chọn trên máy chủ.',
  ],
  [
    new RegExp(
      '^Embedding\\ connection\\ and\\ model\\ provider\\ do\\ not\\ match$',
      'i'
    ),
    'Kết nối embedding không thuộc nhà cung cấp của model đã chọn.',
  ],
  [
    new RegExp(
      '^Maximum\\ 20\\ embedding\\ versions\\.\\ Delete\\ unused\\ versions\\ first\\.$',
      'i'
    ),
    'Chỉ được lưu tối đa 20 phiên bản embedding. Vui lòng xóa phiên bản không còn sử dụng trước.',
  ],
  [
    new RegExp(
      '^AI\\ configuration\\ changed\\.\\ Reload\\ before\\ saving\\.$',
      'i'
    ),
    'Cấu hình AI đã thay đổi. Vui lòng tải lại trang trước khi lưu.',
  ],
  [
    new RegExp(
      '^A\\ supported\\ environment\\ embedding\\ connection\\ is\\ required$',
      'i'
    ),
    'Chưa có kết nối embedding hợp lệ. Vui lòng kiểm tra model và khóa API của nhà cung cấp trên máy chủ.',
  ],
  [
    new RegExp('^Embedding\\ version\\ is\\ not\\ ready$', 'i'),
    'Phiên bản embedding chưa sẵn sàng để sử dụng.',
  ],
  [
    new RegExp(
      '^Vector\\ index\\ is\\ not\\ ready\\ or\\ has\\ an\\ incompatible\\ definition$',
      'i'
    ),
    'Chỉ mục vector chưa sẵn sàng hoặc có cấu hình không tương thích.',
  ],
  [
    new RegExp(
      '^The\\ physical\\ vector\\ index\\ changed\\.\\ Rebuild\\ this\\ version\\ before\\ activation\\.$',
      'i'
    ),
    'Chỉ mục vector đã thay đổi. Vui lòng tạo lại dữ liệu của phiên bản trước khi kích hoạt.',
  ],
  [
    new RegExp('^Embedding\\ version\\ changed$', 'i'),
    'Phiên bản embedding đã thay đổi. Vui lòng tải lại trang và thử lại.',
  ],
  [
    new RegExp(
      '^AI\\ configuration\\ changed\\.\\ Reload\\ before\\ switching\\.$',
      'i'
    ),
    'Cấu hình AI đã thay đổi. Vui lòng tải lại trang trước khi chuyển phiên bản.',
  ],
  [
    new RegExp(
      '^Switch\\ away\\ from\\ the\\ active\\ embedding\\ version\\ first$',
      'i'
    ),
    'Vui lòng ngừng sử dụng hoặc chuyển sang phiên bản khác trước khi thực hiện thao tác này.',
  ],
  [
    new RegExp('^Embedding\\ version\\ not\\ found$', 'i'),
    'Không tìm thấy phiên bản embedding.',
  ],
  [
    new RegExp('^Only\\ terminal\\ versions\\ can\\ be\\ retried$', 'i'),
    'Chỉ có thể thử lại phiên bản đã hoàn tất, thất bại hoặc bị hủy.',
  ],
  [
    new RegExp('^This\\ version\\ is\\ not\\ running$', 'i'),
    'Phiên bản này không có tác vụ đang chạy để hủy.',
  ],
  [
    new RegExp(
      '^Cancel\\ pending\\ work,\\ and\\ wait\\ five\\ minutes\\ after\\ deactivation\\ before\\ deletion$',
      'i'
    ),
    'Hãy hủy tác vụ đang chờ và đợi ít nhất 5 phút sau khi ngừng sử dụng phiên bản trước khi xóa.',
  ],
  [
    new RegExp(
      '^Configure\\ AI\\ providers\\ in\\ the\\ server\\ environment\\ first$',
      'i'
    ),
    'Vui lòng cấu hình nhà cung cấp và khóa API của AI trên máy chủ trước.',
  ],
  [
    new RegExp(
      '^Indexing\\ requires\\ an\\ environment\\ embedding\\ provider$',
      'i'
    ),
    'Vui lòng cấu hình ít nhất một nhà cung cấp embedding trên máy chủ để đồng bộ kiến thức.',
  ],
  [
    new RegExp(
      '^Enable\\ AI\\ and\\ knowledge\\ indexing\\ before\\ synchronizing$',
      'i'
    ),
    'Vui lòng bật trợ lý AI và tự động đồng bộ kiến thức trước khi yêu cầu đồng bộ.',
  ],
  [
    new RegExp('^AI\\ configuration\\ database\\ is\\ unavailable$', 'i'),
    'Hiện không thể kết nối cơ sở dữ liệu cấu hình AI. Vui lòng thử lại sau.',
  ],
  [
    new RegExp('^Active\\ embedding\\ generation\\ is\\ unavailable$', 'i'),
    'Không tìm thấy phiên bản embedding đang sử dụng hoặc phiên bản chưa sẵn sàng. Vui lòng kiểm tra trong phần Đồng bộ kiến thức.',
  ],
  [
    new RegExp('^AI\\ identity\\ is\\ not\\ configured$', 'i'),
    'Chưa cấu hình xác thực phiên AI trên máy chủ. Vui lòng liên hệ quản trị viên.',
  ],
  [
    new RegExp('^Customer\\ session\\ required$', 'i'),
    'Vui lòng đăng nhập tài khoản khách hàng để tiếp tục.',
  ],
  [
    new RegExp('^Customer\\ session\\ expired$', 'i'),
    'Phiên đăng nhập của khách hàng đã hết hạn. Vui lòng đăng nhập lại.',
  ],
  [
    new RegExp('^Conversation\\ not\\ found$', 'i'),
    'Không tìm thấy hội thoại.',
  ],
  [
    new RegExp('^Request\\ ID\\ belongs\\ to\\ different\\ content$', 'i'),
    'Mã yêu cầu đã được dùng cho nội dung khác.',
  ],
  [new RegExp('^Conversation\\ ended$', 'i'), 'Hội thoại đã kết thúc.'],
  [
    new RegExp('^Turn\\ changed;\\ reload\\ history$', 'i'),
    'Lượt trả lời đã thay đổi. Vui lòng tải lại lịch sử hội thoại.',
  ],
  [
    new RegExp(
      '^AI\\ configuration\\ encryption\\ is\\ not\\ configured$',
      'i'
    ),
    'Chưa cấu hình mã hóa thông tin kết nối AI trên máy chủ.',
  ],
  [
    new RegExp('^AI\\ credential\\ could\\ not\\ be\\ decrypted$', 'i'),
    'Không thể đọc thông tin xác thực AI đã lưu. Vui lòng kiểm tra cấu hình máy chủ.',
  ],
  [
    new RegExp(
      '^Embedding\\ model\\ and\\ dimensions\\ do\\ not\\ match$',
      'i'
    ),
    'Model embedding và số chiều vector không tương thích.',
  ],
  [
    new RegExp('^Cancellation\\ response\\ mismatch$', 'i'),
    'Chưa xác nhận được việc dừng trả lời. Vui lòng tải lại lịch sử hội thoại để kiểm tra.',
  ],
  [
    /^Product price changed; refresh and review before ordering$/i,
    'Giá sản phẩm đã thay đổi. Vui lòng cập nhật giá và tồn kho để xem lại trước khi đặt hàng.',
  ],
  [
    /^Insufficient stock$/i,
    'Sản phẩm không đủ tồn kho. Vui lòng cập nhật tồn kho và giảm số lượng.',
  ],
  [
    /^Product is temporarily unavailable$/i,
    'Sản phẩm hiện ngừng bán. Vui lòng chọn sản phẩm khác.',
  ],
  [
    /^Active product not found$/i,
    'Sản phẩm không còn khả dụng. Vui lòng cập nhật giỏ hàng.',
  ],
  [
    /^Variant not found$/i,
    'Biến thể không còn khả dụng. Vui lòng chọn lại biến thể hoặc xóa sản phẩm.',
  ],
  [
    /^Select a product variant$/i,
    'Vui lòng chọn biến thể sản phẩm trước khi đặt hàng.',
  ],
  [
    /^Quantity is below the product minimum order quantity$/i,
    'Số lượng chưa đạt mức đặt tối thiểu của sản phẩm. Vui lòng điều chỉnh giỏ hàng.',
  ],
  [
    /^(Brand|Category) is missing or inactive$/i,
    'Sản phẩm thuộc thương hiệu hoặc danh mục không còn khả dụng. Vui lòng chọn sản phẩm khác.',
  ],
  [
    /^Invalid province\/district\/ward hierarchy$/i,
    'Địa chỉ nhận hàng không hợp lệ. Vui lòng chọn lại tỉnh, huyện và xã.',
  ],
  [
    /^Request ID already used with different checkout data$/i,
    'Yêu cầu đặt hàng này đã được gửi với nội dung khác. Vui lòng kiểm tra lịch sử đơn hàng.',
  ],
  [
    /^email hoặc mật khẩu không chính xác$/i,
    'Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị vô hiệu hóa.',
  ],
  [
    /^token không được cung cấp$/i,
    'Thiếu thông tin xác thực. Vui lòng đăng nhập lại.',
  ],
  [
    /^token không hợp lệ$/i,
    'Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại.',
  ],
  [
    /^token đã hết hạn$/i,
    'Thông tin xác thực đã hết hạn. Vui lòng đăng nhập lại.',
  ],
  [
    /^phiên đăng nhập không còn hợp lệ$/i,
    'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.',
  ],
  [
    /^refresh token không hợp lệ$/i,
    'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.',
  ],
  [
    /^refresh token là bắt buộc$/i,
    'Thiếu thông tin gia hạn phiên. Vui lòng đăng nhập lại.',
  ],
  [
    /^không có quyền truy cập$/i,
    'Tài khoản của bạn không có quyền thực hiện thao tác này.',
  ],
  [
    /^chưa xác thực$/i,
    'Không thể xác minh phiên đăng nhập. Vui lòng đăng nhập lại.',
  ],
  [
    /^quá nhiều yêu cầu xác thực/i,
    'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ vài phút rồi thử lại.',
  ],
  [/^làm mới token thành công$/i, 'Đã gia hạn phiên đăng nhập thành công.'],
  [/^số lượng phải\s*>=\s*1$/i, 'Số lượng phải từ 1 trở lên.'],
  [
    /^đơn hàng phải có ít nhất 1 sản phẩm$/i,
    'Đơn hàng phải có ít nhất một sản phẩm.',
  ],
  [/^họ không được để trống$/i, 'Vui lòng nhập tên.'],
  [/^tên không được để trống$/i, 'Vui lòng nhập họ.'],
  [/^số điện thoại không hợp lệ$/i, 'Vui lòng nhập số điện thoại hợp lệ.'],
  [/^sku phải có ít nhất 3 ký tự$/i, 'Mã SKU phải có ít nhất 3 ký tự.'],
  [/^sku tối đa 64 ký tự$/i, 'Mã SKU không được vượt quá 64 ký tự.'],
  [
    /^giá biến thể không được nhỏ hơn 0$/i,
    'Giá biến thể không được nhỏ hơn 0.',
  ],
];

function translateMessage(message: string): string {
  const translation = localizedMessages.find(([pattern]) =>
    pattern.test(message)
  )?.[1];
  return translation ?? message;
}

function isLoginRequest(url: string | undefined): boolean {
  return Boolean(
    url && /(?:^|\/)(?:customer-)?auth\/login(?:[?#]|$)/i.test(url)
  );
}

function statusMessage(status: number, loginRequest: boolean): string {
  switch (status) {
    case 400:
      return 'Thông tin không hợp lệ hoặc chưa đầy đủ. Hãy kiểm tra các trường được đánh dấu và thử lại.';
    case 401:
      return loginRequest
        ? 'Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị vô hiệu hóa.'
        : 'Phiên đăng nhập đã hết hạn hoặc không còn hợp lệ. Vui lòng đăng nhập lại.';
    case 403:
      return 'Tài khoản của bạn không có quyền thực hiện thao tác này.';
    case 404:
      return 'Không tìm thấy dữ liệu hoặc dịch vụ được yêu cầu.';
    case 408:
      return 'Máy chủ xử lý quá thời gian cho phép. Vui lòng thử lại.';
    case 409:
      return 'Thao tác xung đột với dữ liệu hiện tại. Hãy kiểm tra thông tin và thử lại.';
    case 413:
      return 'Tệp hoặc yêu cầu quá lớn. Hãy chọn tệp nhỏ hơn và thử lại.';
    case 415:
      return 'Loại tệp không được hỗ trợ. Hãy chọn định dạng phù hợp và thử lại.';
    case 422:
      return 'Không thể xử lý yêu cầu vì có giá trị không hợp lệ.';
    case 429:
      return 'Có quá nhiều yêu cầu. Vui lòng chờ vài phút rồi thử lại.';
    case 502:
    case 503:
      return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
    case 504:
      return 'Dịch vụ phản hồi quá chậm. Vui lòng thử lại sau giây lát.';
    default:
      if (status >= 500)
        return 'Dịch vụ gặp lỗi máy chủ. Vui lòng thử lại hoặc liên hệ quản trị viên.';
      return 'Yêu cầu bị từ chối. Hãy kiểm tra thông tin và thử lại.';
  }
}

function transportMessage(error: unknown): string {
  if (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')
  ) {
    return 'Yêu cầu đã bị hủy do trang hoặc phiên đăng nhập thay đổi. Hãy thử lại nếu thao tác chưa hoàn tất.';
  }
  if (!axios.isAxiosError(error)) return '';
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'Dịch vụ phản hồi quá chậm. Hãy kiểm tra kết nối và thử lại.';
  }
  if (error.code === 'ERR_NETWORK') {
    return 'Không thể kết nối dịch vụ. Hãy kiểm tra kết nối mạng và thử lại.';
  }
  if (error.code === 'ERR_BAD_RESPONSE') {
    return 'Ứng dụng không thể đọc phản hồi từ dịch vụ. Vui lòng thử lại hoặc liên hệ quản trị viên.';
  }
  return '';
}

function translateIssueMessage(message: string): string {
  return translateMessage(message);
}

function validationLabel(field: string, url = ''): string {
  const path = field
    .replace(/^(body|query|params)\./, '')
    .replace(/\[(\d+)\]/g, '.$1');
  const variant = /^variants\.(\d+)\.(.+)$/.exec(path);
  const key = (variant?.[2] ?? path).split('.').at(-1) ?? '';
  const labels: Record<string, string> = {
    product_name: 'Tên sản phẩm',
    model_year: 'Năm sản xuất',
    sku: 'SKU',
    variant_name: 'Tên biến thể',
    stock: 'Tồn kho',
    price: 'Giá',
    compare_at_price: 'Giá niêm yết (trước giảm)',
    discount: 'Giảm giá',
    category: 'Danh mục',
    brand: 'Thương hiệu',
    thumbnail: 'Đường dẫn ảnh đại diện',
    description: 'Mô tả',
    firstName: 'Tên',
    lastName: 'Họ',
    email: 'Địa chỉ email',
    password: 'Mật khẩu',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu',
    personalEmail: 'Địa chỉ email cá nhân',
    phone: 'Số điện thoại',
    location: 'Địa điểm',
    bio: 'Giới thiệu',
    parent: 'Danh mục cha',
    icon: 'Ảnh danh mục',
    logoUrl: 'Ảnh thương hiệu',
    role: 'Vai trò',
    expectedVersion: 'Phiên bản sản phẩm',
    revision: 'Phiên bản cấu hình',
    connectionId: 'Kết nối embedding',
    generationId: 'Phiên bản embedding',
    dimensions: 'Số chiều vector',
    model: 'Model AI',
    engine: 'Cách tìm kiếm ngữ nghĩa',
    confirm: 'Xác nhận thao tác',
    isActive: 'Trạng thái',
    is_active: 'Trạng thái',
    active: 'Trạng thái',
  };
  let label =
    labels[key] ??
    (key
      ? key.replace(/_/g, ' ').replace(/^./, (value) => value.toUpperCase())
      : 'Trường này');
  if (key === 'name')
    label = /brands/.test(url)
      ? 'Tên thương hiệu'
      : /categories/.test(url)
        ? 'Tên danh mục'
        : 'Tên';
  if (variant) {
    if (/\.images\./.test(path)) label = 'Đường dẫn ảnh';
    if (/\.options\./.test(path))
      label = key === 'name' ? 'Tên tùy chọn' : 'Giá trị tùy chọn';
    return `Biến thể ${Number(variant[1]) + 1}: ${label === 'SKU' ? label : label.toLowerCase()}`;
  }
  return label;
}

function validationMessage(message: string, label: string): string {
  const limit =
    /^Too (small|big): expected (number|string|array) to (?:be|have) (?:>=|<=)([\d.e+-]+)/i.exec(
      message
    );
  if (limit) {
    const minimum = limit[1].toLowerCase() === 'small';
    const kind = limit[2].toLowerCase();
    const bound = limit[3];
    if (kind === 'number' && minimum && Number(bound) === 0)
      return `${label} không được âm.`;
    if (kind === 'string')
      return minimum
        ? `${label} phải có ít nhất ${bound} ký tự.`
        : `${label} không được vượt quá ${bound} ký tự.`;
    if (kind === 'array')
      return `${label} phải có ${minimum ? 'ít nhất' : 'không quá'} ${bound} phần tử.`;
    return `${label} phải ${minimum ? 'từ' : 'không quá'} ${bound}.`;
  }
  if (/^Invalid input: expected int\b/i.test(message))
    return `${label} phải là số nguyên.`;
  if (/^Invalid input: expected number\b/i.test(message))
    return `Vui lòng nhập số hợp lệ cho ${label.toLowerCase()}.`;
  if (/^Invalid UUID$/i.test(message)) return `${label} không hợp lệ.`;
  if (/^Unrecognized keys?:/i.test(message))
    return 'Yêu cầu có trường thông tin không được hỗ trợ.';
  if (/^Invalid option:/i.test(message))
    return `Vui lòng chọn ${label.toLowerCase()} hợp lệ.`;
  if (/^Invalid (input|type|string)(:|$)/i.test(message))
    return `Vui lòng nhập giá trị hợp lệ cho ${label.toLowerCase()}.`;
  return translateIssueMessage(message);
}

export function getApiError(error: unknown): ApiError {
  if (error instanceof ZodError) {
    return {
      statusCode: 0,
      message:
        'Dịch vụ trả về dữ liệu không đúng định dạng. Vui lòng liên hệ quản trị viên.',
    };
  }

  if (axios.isAxiosError<ApiError>(error)) {
    const statusCode = error.response?.status ?? 0;
    const responseMessage = error.response?.data?.message;
    if (
      statusCode === 429 &&
      /^Too many authentication requests; retry later$/i.test(
        responseMessage ?? ''
      )
    ) {
      const seconds = Number(error.response?.headers['retry-after']);
      const wait =
        Number.isFinite(seconds) && seconds > 0
          ? seconds < 60
            ? `${Math.ceil(seconds)} giây`
            : `${Math.ceil(seconds / 60)} phút`
          : null;
      return {
        statusCode,
        message: wait
          ? `Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng thử lại sau ${wait}.`
          : 'Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng chờ vài phút rồi thử lại.',
      };
    }
    const errors = error.response?.data?.errors?.map((issue) => ({
      ...issue,
      message: validationMessage(
        issue.message,
        validationLabel(issue.field, error.config?.url)
      ),
    }));
    const genericResponseMessage =
      responseMessage !== undefined &&
      /^(validation failed|database validation failed|unauthorized|forbidden|not found|conflict|internal server error|bad request)$/i.test(
        responseMessage
      );
    const message = responseMessage
      ? genericResponseMessage
        ? errors?.length
          ? errors
              .map(({ field, message: issueMessage }) => {
                const label = validationLabel(field, error.config?.url);
                return issueMessage
                  .toLowerCase()
                  .startsWith(label.toLowerCase())
                  ? issueMessage
                  : `${label}: ${issueMessage}`;
              })
              .join('; ')
          : statusMessage(statusCode, isLoginRequest(error.config?.url))
        : translateIssueMessage(responseMessage)
      : statusCode
        ? statusMessage(statusCode, isLoginRequest(error.config?.url))
        : transportMessage(error) ||
          'Không thể hoàn tất yêu cầu. Hãy kiểm tra kết nối và thử lại.';

    return {
      statusCode,
      message,
      errors,
      ...(typeof error.response?.data?.code === 'string'
        ? { code: error.response.data.code }
        : {}),
    };
  }

  if (error instanceof Error) {
    switch (error.message) {
      case 'Session changed':
        return {
          statusCode: 0,
          message:
            'Phiên đăng nhập thay đổi khi đang xử lý yêu cầu. Vui lòng thử lại thao tác.',
        };
      case 'Invalid token response':
        return {
          statusCode: 0,
          message:
            'Dịch vụ trả về phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
        };
      case 'Your session has expired.':
        return {
          statusCode: 401,
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        };
      default:
        return { statusCode: 0, message: translateIssueMessage(error.message) };
    }
  }

  return { statusCode: 0, message: 'Đã xảy ra lỗi khi xử lý yêu cầu.' };
}
