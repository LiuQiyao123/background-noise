import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case networkError(Error)
    case httpError(Int, String)
    case decodingError(Error)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "无效的 URL"
        case .networkError(let e): return "网络错误: \(e.localizedDescription)"
        case .httpError(let code, let msg): return "\(code): \(msg)"
        case .decodingError: return "数据解析失败"
        case .unauthorized: return "未登录"
        }
    }
}

final class APIClient {
    static let shared = APIClient()

    // Change this to your actual server URL
    private let baseURL = "https://bnoise.yokileopard.top/api/v1"

    private var token: String? {
        UserDefaults.standard.string(forKey: "bn_token")
    }

    func request<T: Decodable>(
        _ path: String,
        method: String = "GET",
        body: [String: Any]? = nil,
        auth: Bool = true
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if auth, let token {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            req.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: req)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.httpError(0, "未知响应")
        }

        if httpResponse.statusCode == 401 {
            throw APIError.unauthorized
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let msg = String(data: data, encoding: .utf8) ?? ""
            throw APIError.httpError(httpResponse.statusCode, msg)
        }

        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    // Convenience for simple GET requests wrapped in { data: ... }
    func fetch<T: Decodable>(_ path: String, auth: Bool = true) async throws -> T {
        let wrapper: ResponseWrapper<T> = try await request(path, auth: auth)
        return wrapper.data
    }

    func post<T: Decodable>(_ path: String, body: [String: Any], auth: Bool = true) async throws -> T {
        let wrapper: ResponseWrapper<T> = try await request(path, method: "POST", body: body, auth: auth)
        return wrapper.data
    }
}

struct ResponseWrapper<T: Decodable>: Decodable {
    let data: T
}
