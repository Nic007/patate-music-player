
/**
 * This function creates an action named "APPEND_SEARCH_RESULTS" with
 * the required data to execute the reducer action.
 *
 * @return ActionCreator The action creator
 */
export function appendSearchResults(results) {
  return {
    type: 'APPEND_SEARCH_RESULTS',
    results,
  };
}

/**
 * This function creates an action named "CLEAR_SEARCH_RESULTS" with
 * the required data to execute the reducer action.
 *
 * @return ActionCreator The action creator
 */
export function clearSearchResults() {
  return {
    type: 'CLEAR_SEARCH_RESULTS',
  };
}

/**
 * This function creates an action named "SEARCH" with
 * the required data to execute the reducer action.
 *
 * @return ActionCreator The action creator
 */
export function search(keywords) {
  return {
    type: 'SEARCH',
    keywords,
  };
}

/**
 * This function creates an action named "ENDSEARCH" with
 * the required data to execute the reducer action.
 *
 * @return ActionCreator The action creator
 */
export function endSearch() {
  return {
    type: 'ENDSEARCH',
  };
}
