const API_ENDPOINT = '';

const request = async (url) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw errorData;
    }
  } catch (e) {
    throw {
      message: e.message,
      status: e.status
    };
  }
};

export const api = {
  fetchProducts: async () => {
    try {
      const data = await request(`${API_ENDPOINT}/products`);
      return {
        isError: false,
        data
      };
    } catch (e) {
      return {
        isError: true,
        data: e
      };
    }
  },
  fetchProductDetail: async (id) => {
    try {
      const data = await request(`${API_ENDPOINT}/products/${id}`);
      return {
        isError: false,
        data
      };
    } catch (e) {
      return {
        isError: true,
        data: e
      };
    }
  }
};
