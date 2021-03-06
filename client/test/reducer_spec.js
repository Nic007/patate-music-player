import { Map, fromJS, Stack, List } from 'immutable';
import { expect } from 'chai';
import Sound from 'react-sound';
import reducer from '../app/reducer';


describe('reducer', () => {
  it('handles SET_STATE', () => {
    const initialState = Map();
    const action = {
      type: 'SET_STATE',
      state: Map({
        playback: Map({
          playStatus: Sound.status.STOPPED,
        }),
      }),
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      playback: {
        playStatus: Sound.status.STOPPED,
      },
    }));
  });

  it('handles SET_STATE with plain JS payload', () => {
    const initialState = Map();
    const action = {
      type: 'SET_STATE',
      state: {
        playback: {
          playStatus: Sound.status.STOPPED,
        },
      },
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      playback: {
        playStatus: Sound.status.STOPPED,
      },
    }));
  });

  it('handles SET_STATE without initial state', () => {
    const action = {
      type: 'SET_STATE',
      state: {
        playback: {
          playStatus: Sound.status.STOPPED,
        },
      },
    };
    const nextState = reducer(undefined, action);

    expect(nextState).to.equal(fromJS({
      playback: {
        playStatus: Sound.status.STOPPED,
      },
    }));
  });

  it('handles TOGGLEPLAY by setting playStatus to PLAYING', () => {
    const state = fromJS({
      playback: {
        playStatus: Sound.status.STOPPED,
      },
      queue: List.of({ }),
    });
    const action = { type: 'TOGGLEPLAY' };
    const nextState = reducer(state, action);

    expect(nextState.getIn(['playback', 'playStatus'])).to.equal(Sound.status.PLAYING);
  });

  it('handles TOGGLEPLAY by setting playStatus to PAUSED when PLAYING', () => {
    const state = fromJS({
      playback: {
        playStatus: Sound.status.PLAYING,
      },
      queue: List.of({ }),
    });
    const action = { type: 'TOGGLEPLAY' };
    const nextState = reducer(state, action);

    expect(nextState.getIn(['playback', 'playStatus'])).to.equal(Sound.status.PAUSED);
  });

  it('does not set playStatus to PLAYING for PLAY when no tracks', () => {
    const state = fromJS({
      playback: {
        playStatus: Sound.status.STOPPED,
      },
      queue: List(),
    });
    const action = { type: 'PLAY' };
    const nextState = reducer(state, action);

    expect(nextState.getIn(['playback', 'playStatus'])).to.equal(Sound.status.STOPPED);
  });

  it('handles PLAY by setting playStatus to PLAYING when stopped', () => {
    const state = fromJS({
      playback: {
        playStatus: Sound.status.STOPPED,
      },
      queue: List.of({ title: 'Test1' }),
    });
    const action = { type: 'PLAY' };
    const nextState = reducer(state, action);

    expect(nextState.getIn(['playback', 'playStatus'])).to.equal(Sound.status.PLAYING);
  });

  it('handles PLAY by setting playStatus to PLAYING when paused', () => {
    const state = fromJS({
      playback: {
        playStatus: Sound.status.PAUSED,
      },
      queue: List.of({ title: 'Test1' }),
    });
    const action = { type: 'PLAY' };
    const nextState = reducer(state, action);

    expect(nextState.getIn(['playback', 'playStatus'])).to.equal(Sound.status.PLAYING);
  });

  it('handles PLAY by setting playStatus to PLAYING when playing', () => {
    const state = fromJS({
      playback: {
        playStatus: Sound.status.PLAYING,
      },
      queue: List.of({ title: 'Test1' }),
    });
    const action = { type: 'PLAY' };
    const nextState = reducer(state, action);

    expect(nextState.getIn(['playback', 'playStatus'])).to.equal(Sound.status.PLAYING);
  });

  it('handles STOP by setting playStatus to STOPPED ', () => {
    const state = fromJS({
      playback: {
        playStatus: Sound.status.PLAYING,
      },
    });
    const action = { type: 'STOP' };
    const nextState = reducer(state, action);

    expect(nextState.getIn(['playback', 'playStatus'])).to.equal(Sound.status.STOPPED);
  });

  it('handles ENQUEUE by adding the first track to the play queue ', () => {
    const state = fromJS({
      tracks: [
        { title: 'Test1' },
        { title: 'Test2' },
      ],
      queue: List(),
    });
    const action = { type: 'ENQUEUE' };
    const nextState = reducer(state, action);

    expect(nextState.get('queue').size).to.equal(1);
    expect(nextState.get('queue').get(0).get('title')).to.equal('Test1');
  });

  it('handles ENQUEUE by adding the given tracks to the play queue ', () => {
    const state = fromJS({
      tracks: [
        { title: 'Test1' },
        { title: 'Test2' },
      ],
      queue: List(),
    });
    const action = {
      type: 'ENQUEUE',
      tracks: fromJS([
        { title: 'Test3' },
        { title: 'Test4' },
      ]),
    };
    const nextState = reducer(state, action);

    expect(nextState.get('queue').size).to.equal(2);
    expect(nextState.get('queue').get(0).get('title')).to.equal('Test3');
    expect(nextState.get('queue').get(1).get('title')).to.equal('Test4');
  });

  it('handles NEXT by adding the next track to the history and remove track from queue', () => {
    const state = fromJS({
      queue: List.of({ title: 'Test1' }, { title: 'Test2' }),
      history: Stack(),
    });
    const action = { type: 'NEXT' };
    const nextState = reducer(state, action);

    expect(nextState.get('history').size).to.equal(1);
    expect(nextState.get('history').get(0).title).to.equal('Test1');
    expect(nextState.get('queue').size).to.equal(1);
    expect(nextState.get('queue').get(0).title).to.equal('Test2');
  });

  it('handles NEXT when no more tracks in queue', () => {
    const state = fromJS({
      playback: {
        playStatus: Sound.status.PLAYING,
      },
      queue: List.of({ title: 'Test1' }),
      history: Stack.of(
        { title: 'Test2' },
      ),
    });
    const action = { type: 'NEXT' };
    const nextState = reducer(state, action);

    expect(nextState.get('history').size).to.equal(1);
    expect(nextState.getIn(['playback', 'playStatus'])).to.equal(Sound.status.STOPPED);
  });

  it('handles PREV by poping a track from history and add it in front of queue', () => {
    const state = fromJS({
      queue: List.of({ title: 'Test2' }),
      history: Stack.of({ title: 'Test1' }),
    });
    const action = { type: 'PREV' };
    const nextState = reducer(state, action);

    expect(nextState.get('history').size).to.equal(0);
    expect(nextState.get('queue').size).to.equal(2);
    expect(nextState.get('queue').get(0).title).to.equal('Test1');
  });

  it('handles PREV when no more tracks in history', () => {
    const state = fromJS({
      queue: List.of({ title: 'Test1' }, { title: 'Test2' }),
      history: Stack.of(),
    });
    const action = { type: 'PREV' };
    const nextState = reducer(state, action);

    expect(nextState.get('history').size).to.equal(0);
    expect(nextState.get('queue').size).to.equal(2);
    expect(nextState.get('queue').get(0).title).to.equal('Test1');
    expect(nextState.get('queue').get(1).title).to.equal('Test2');
  });

  it('handles PREV when no more tracks in history', () => {
    const state = fromJS({
      queue: List.of({ title: 'Test1' }, { title: 'Test2' }),
      history: Stack.of(),
    });
    const action = { type: 'PREV' };
    const nextState = reducer(state, action);

    expect(nextState.get('history').size).to.equal(0);
    expect(nextState.get('queue').size).to.equal(2);
    expect(nextState.get('queue').get(0).title).to.equal('Test1');
    expect(nextState.get('queue').get(1).title).to.equal('Test2');
  });

  it('handles SEARCH by setting searchQuery to the right string', () => {
    const state = fromJS({
      searchQuery: '',
    });
    const action = { type: 'SEARCH', keywords: 'patate' };
    const nextState = reducer(state, action);

    expect(nextState.get('searchQuery')).to.equal('patate');
  });

  it('handles ENDSEARCH by setting searchQuery to the empty string', () => {
    const state = fromJS({
      searchQuery: 'patate',
    });
    const action = { type: 'ENDSEARCH' };
    const nextState = reducer(state, action);

    expect(nextState.get('searchQuery')).to.equal('');
  });

  it('handles APPEND_SEARCH_RESULTS by adding tracks to the searchResults state', () => {
    const state = fromJS({
      searchResults: List(),
    });

    const action = {
      type: 'APPEND_SEARCH_RESULTS',
      results: [
        { title: 'Test1' },
        { title: 'Test2' },
      ],
    };
    const nextState = reducer(state, action);

    expect(nextState.get('searchResults').get(0).title).to.equal('Test1');
    expect(nextState.get('searchResults').get(1).title).to.equal('Test2');
  });

  it('handles CLEAR_SEARCH_RESULTS by emptying searchResults', () => {
    const state = fromJS({
      searchResults: List.of({ title: 'Test1' }),
    });

    const action = {
      type: 'CLEAR_SEARCH_RESULTS',
    };
    const nextState = reducer(state, action);

    expect(nextState.get('searchResults').size).to.equal(0);
  });

  it('handles CLEAR_QUEUE by emptying the play queue', () => {
    const state = fromJS({
      queue: List.of({ title: 'Test2' }),
    });
    const action = { type: 'CLEAR_QUEUE' };
    const nextState = reducer(state, action);

    expect(nextState.get('queue').size).to.equal(0);
  });

  it('handles FORM_ERROR by emptying the play queue', () => {
    const error = 'This is an error';
    const state = fromJS({
      form_error: '',
    });
    const action = { type: 'FORM_ERROR', error };
    const nextState = reducer(state, action);

    expect(nextState.get('form_error')).to.equal(error);
  });

  it('handles LOGIN_SUCCESS by emptying the play queue', () => {
    const accessToken = 'qwertyuiop';
    const state = fromJS({
      accessToken: '',
    });
    const action = { type: 'LOGIN_SUCCESS', accessToken };
    const nextState = reducer(state, action);

    expect(nextState.get('accessToken')).to.equal(accessToken);
  });

  it('handles DISCONNECT_SOURCE_SUCCESS by removing the source', () => {
    const sourceName = 'sourceName';
    const state = fromJS({
      connectedSources: List([{
        name: sourceName,
      }]),
    });
    const action = { type: 'DISCONNECT_SOURCE_SUCCESS', sourceName };
    const nextState = reducer(state, action);

    expect(nextState.get('connectedSources')).to.equal(List([]));
  });

  it('handles CONNECTED_SOURCE by adding the source', () => {
    const state = fromJS({
      connectedSources: List(),
    });

    const source = {
      id: 'sourceId',
      name: 'sourceName',
    };
    const action = { type: 'CONNECTEDSOURCE', source };
    const nextState = reducer(state, action);

    expect(nextState.get('connectedSources')).to.equal(List([source]));
  });

  it('handles CONNECTED_SOURCE by adding a second source', () => {
    const connectedSources = List([{
      id: 'sourceId1',
      name: 'sourceName',
    }]);
    const state = fromJS({
      connectedSources,
    });

    const source = {
      id: 'sourceId2',
      name: 'sourceName',
    };

    const action = { type: 'CONNECTEDSOURCE', source };
    const nextState = reducer(state, action);

    expect(
      nextState.get('connectedSources'),
    ).to.equal(
      connectedSources.push(source),
    );
  });

  it('handles CONNECTED_SOURCE by not adding the same source twice', () => {
    const source = {
      id: 'sourceId',
      name: 'sourceName',
    };
    const state = fromJS({
      connectedSources: List([source]),
    });
    const action = { type: 'CONNECTEDSOURCE', source };
    const nextState = reducer(state, action);

    expect(nextState.get('connectedSources')).to.equal(List([source]));
  });

  it('handles CONNEXION_FAILED_SOURCE by doing nothing', () => {
    const state = fromJS({});
    const action = { type: 'CONNEXIONFAILEDSOURCE' };
    const nextState = reducer(state, action);

    expect(nextState).to.equal(state);
  });
});
