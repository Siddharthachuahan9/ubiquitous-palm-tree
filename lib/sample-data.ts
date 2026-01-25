// Sample JSON data for demonstrating json0 features

export const SAMPLE_DIFF_DATA = {
  before: {
    "user": {
      "id": 123,
      "name": "John Smith",
      "email": "john@example.com",
      "role": "developer"
    }
  },
  after: {
    "user": {
      "id": 123,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "developer"
    }
  }
};

// Sample data for array of JSON objects (e.g., API responses)
export const SAMPLE_ARRAY_DIFF_DATA = {
  before: [
    { "id": 1, "name": "Alice", "age": 28, "role": "Engineer" },
    { "id": 2, "name": "Bob", "age": 32, "role": "Designer" },
    { "id": 3, "name": "Charlie", "age": 25, "role": "Manager" }
  ],
  after: [
    { "id": 1, "name": "Alice", "age": 29, "role": "Senior Engineer" },
    { "id": 2, "name": "Bob", "age": 32, "role": "Designer" },
    { "id": 4, "name": "Diana", "age": 27, "role": "Engineer" }
  ]
};

// Sample data for JSONPath mode
export const SAMPLE_JSONPATH_DATA = {
  "users": [
    { "id": 1, "name": "Alice", "age": 28, "active": true },
    { "id": 2, "name": "Bob", "age": 32, "active": false },
    { "id": 3, "name": "Charlie", "age": 25, "active": true }
  ],
  "total": 3
};
