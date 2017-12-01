import Axios from 'axios';
import { fetchAuthorizationCode, fetchTokenCode } from './actions/Connexion.helper';

import JamendoProxy from '../../src/model/JamendoProxy';
import SoundCloudProxy from '../../src/model/SoundCloudProxy';
import SpotifyProxy from '../../src/model/SpotifyProxy';

export const DISCONNECT_SOURCE_SUCCESS = 'DISCONNECT_SOURCE_SUCCESS';

/**
 * disconnectSuccess - Creates an action named "DISCONNECT_SOURCE_SUCCESS" with
 * the required data to execute the reducer action
 *
 * @param {object} source The source affected by the action
 *
 * @return {ActionCreator} The action creator
 */
function disconnectSuccess(source) {
  return {
    type: DISCONNECT_SOURCE_SUCCESS,
    source,
  };
}

export const CONNECTED_SOURCE = 'CONNECTEDSOURCE';

/**
 * connectedSource - Creates an action named "CONNECTEDSOURCE" with
 * the required data to execute the reducer action
 *
 * @param {object} source The source affected by the action
 *
 * @return {ActionCreator} The action creator
 */
function connectedSource(source) {
  return {
    type: CONNECTED_SOURCE,
    source,
  };
}

export const CONNEXION_FAILED_SOURCE = 'CONNEXIONFAILEDSOURCE';
/**
 * connexionFailedSource - Creates an action named "CONNEXIONFAILEDSOURCE" with
 * the required data to execute the reducer action
 *
 * @param {string} error The reason of the failure
 *
 * @return {ActionCreator} The action creator
 */
function connexionFailedSource(error) {
  return {
    type: CONNEXION_FAILED_SOURCE,
    error,
  };
}

/**
 * disconnect - Disconnect a source and dispatch the correct actions
 *
 * @param {string} sourceId The id of the source affected by the action
 *
 * @return {Promise} The promise to wait this action
 */
export function disconnect(sourceId, userToken) {
  return async (dispatch) => {
    // Actually remove the source
    await Axios.delete(`http://localhost:3002/api/removeSource/${sourceId}`, {
      headers: { token: userToken },
    });

    return dispatch(disconnectSuccess(sourceId));
  };
}

/**
 * connect - Connect a source and dispatch the correct actions
 *
 * @param {string} sourceName The name of the source affected by the action
 * @param {string} userToken The name of the source affected by the action
 *
 * @return {Promise} The promise to wait this action
 */
export function connect(sourceName, userToken) {
  return async (dispatch) => {
    const proxy = ((name) => {
      if (name === 'Jamendo') {
        return new JamendoProxy();
      } else if (name === 'SoundCloud') {
        return new SoundCloudProxy();
      }
      return new SpotifyProxy();
    })(sourceName);

    let authCode = proxy.getAccessToken();

    if (proxy.needsAuthentification()) {
      try {
        const authUrl = await fetchAuthorizationCode(proxy);
        authCode = await fetchTokenCode(proxy, authUrl);

        // Actually add the source
        const response = await Axios.post('http://localhost:3002/api/addSource', { name: sourceName, accessToken: authCode }, {
          headers: { token: userToken },
        });

        return dispatch(connectedSource(response.data.source));
      } catch (error) {
        return dispatch(connexionFailedSource(error));
      }
    }

    // Actually add the source
    const response = await Axios.post('http://localhost:3002/api/addSource', { name: sourceName, accessToken: authCode }, {
      headers: { token: userToken },
    });

    return dispatch(connectedSource(response.data.source));
  };
}
