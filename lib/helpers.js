import {
  ACCOUNT_ID,
  API_HOST,
  API_TOKEN,
} from "./constants.js";
import { fetchRetry } from "./utils.js";

/**
 * Fires request to the specified URL.
 * @param {string} url The URL to which the request will be fired.
 * @param {RequestInit} options The options to be passed to `fetch`.
 * @returns {Promise}
 */
const request = async (url, options) => {
  if (!API_TOKEN || !ACCOUNT_ID) {
    throw new Error(
      "The following secrets are required: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID"
    );
  }

  const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
  };

  try {
    const response = await fetchRetry(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...headers,
      },
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Cloudflare API request failed - ${error?.message || String(error)}`);
  }
};

/**
 * Fires request to the Zero Trust gateway.
 * @param {string} path The path which will be appended to the request URL.
 * @param {RequestInit} options The options to be passed to `fetch`.
 * @returns {Promise}
 */
export const requestGateway = (path, options) =>
  request(`${API_HOST}/accounts/${ACCOUNT_ID}/gateway${path}`, options);

/**
 * Normalizes a domain.
 * @param {string} value The value to be normalized.
 * @param {boolean} isAllowlisting Whether the value is to be allowlisted.
 * @returns {string}
 */
export const normalizeDomain = (value, isAllowlisting) => {
  const init = (isAllowlisting) ? value.replace("@@||", "") : value;
  const normalized = init
    .replace(/(0\.0\.0\.0|127\.0\.0\.1|::1|::)\s+/, "")
    .replace("||", "")
    .replace("^$important", "")
    .replace("*.", "")
    .replace("^", "");

  return normalized;
};
