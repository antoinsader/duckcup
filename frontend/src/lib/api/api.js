import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const FRONT_END_NAME = process.env.REACT_APP_FRONT_END_NAME;
const DEFAULT_REQUEST_TIMEOUT = 120000;

// Create a reusable instance with error handling
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": `${FRONT_END_NAME} app Frontend`,
  },
  timeout: DEFAULT_REQUEST_TIMEOUT,
  withCredentials: true,
});

export const apiRequest = async ({
  method = "POST",
  route,
  body,
  params,
  headers,
  silence_error_handling,
  timeout = DEFAULT_REQUEST_TIMEOUT,
}) => {
  // You don't need to do any console when you use this function

  try {
    const response = await api({
      method,
      url: route,
      data: body,
      params,
      headers,
      timeout,
    });
    return response.data;
  } catch (error) {
    const { config, response } = error;
    const route = config?.url || "unknown route";
    const status = response?.status;
    const message = response?.data?.message || error.message || response?.data;
    const errorPrefix = `[API Error ${status}] [route: ${route}]:`;
    if(silence_error_handling){
      console.log(
        `${errorPrefix} [Note: Error is not handled because silent..] [Message: ${message}]`
      );
      return ;

    }
    if (status === 401) {
      console.error(
        `${errorPrefix} [Note: Not authenticated. Logging out..] [Message: ${message}]`
      );

      window.location.href = "/login";
    } else if (status === 490) {
      console.error(
        `${errorPrefix} [Note: API application failure. Check server logs.] [Message: ${message}]`
      );
    } else if (status === 491 || status === 492) {
      console.error(
        `${errorPrefix} [Note: Sever internal error. Check server logs.] [Message: ${message}]`
      );
    } else if (status === 404) {
      console.error(
        `${errorPrefix} [Note: Route returned 404. Make sure the api is working and listening and the route is there.] [Message: ${message}]`
      );
    }
    else if (status === 405) {
      console.error(
        `${errorPrefix} [Note: Method not allowed, make sure you are setting the correct method (GET, POST..).] [Message: ${message}]`
      );
    }
    else {
      console.error(
        `${errorPrefix} [Note: Unknown error.] [Message: ${message}] [] `
      );
    }
    return message || '';
  }
};

export const apiBlobRequest = async ({
  method = "POST",
  route,
  body,
  params,
  headers,
  silence_error_handling,
  timeout = DEFAULT_REQUEST_TIMEOUT,
  response_type = "blob",
}) => {
  try {
    const response = await api({
      method,
      url: route,
      data: body,
      params,
      headers,
      timeout,
      responseType: response_type,
    });

    return response;
  } catch (error) {
    const { config, response } = error;
    const route = config?.url || "unknown route";
    const status = response?.status;
    const message = error.message || response?.statusText || "Request failed";
    const errorPrefix = `[API Error ${status}] [route: ${route}]:`;

    if (silence_error_handling) {
      console.log(
        `${errorPrefix} [Note: Error is not handled because silent..] [Message: ${message}]`
      );
      return null;
    }

    if (status === 401) {
      console.error(
        `${errorPrefix} [Note: Not authenticated. Logging out..] [Message: ${message}]`
      );
      window.location.href = "/login";
    } else if (status === 490) {
      console.error(
        `${errorPrefix} [Note: API application failure. Check server logs.] [Message: ${message}]`
      );
    } else if (status === 491 || status === 492) {
      console.error(
        `${errorPrefix} [Note: Sever internal error. Check server logs.] [Message: ${message}]`
      );
    } else if (status === 404) {
      console.error(
        `${errorPrefix} [Note: Route returned 404. Make sure the api is working and listening and the route is there.] [Message: ${message}]`
      );
    } else if (status === 405) {
      console.error(
        `${errorPrefix} [Note: Method not allowed, make sure you are setting the correct method (GET, POST..).] [Message: ${message}]`
      );
    } else {
      console.error(`${errorPrefix} [Note: Unknown error.] [Message: ${message}] [] `);
    }

    return null;
  }
};
