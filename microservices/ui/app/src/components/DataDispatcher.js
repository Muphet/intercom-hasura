import { Config } from './Config';
import { mFetch, HASURA_DEFAULT_HEADERS } from './Auth';

const BASE_URL = 'https://api.' + Config.cluster + '.hasura-app.io';
// const BASE_URL = 'http://localhost:8080';

const API_URLS = {
  add_entry: BASE_URL + '/add_entries'
}

/**
 * Dispatch table data to the provided backend.
 * 
 * @param [Object] dataRows   The array of table row data ({key, message})
 */
export const dispatchTableData = (dataRows, onSuccess, onError) => {
  // The data to piggyback
  let payload = { data: dataRows };

  // Request options for mFetch
  let request_opts = {
    'method': 'POST', 'body': JSON.stringify(payload),
    'headers': { 'Content-Type': 'application/json' }
  }

  mFetch(
    API_URLS.add_entry, request_opts,
    (data) => {
      if (data.status === 'success') { onSuccess && onSuccess(null); }
    },
    (error) => {
      if (error.status === 'error') { onError && onError(null); }
    }
  )
}
