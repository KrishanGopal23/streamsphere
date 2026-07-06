export function roomReducer(state, action) {
  switch (action.type) {
    case "SET_ROOM":
      return { ...state, room: action.room };
    case "SET_SYNC":
      return { ...state, syncState: action.syncState };
    case "SET_MESSAGES":
      return { ...state, messages: action.messages };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message].slice(-150) };
    case "SET_QUEUE":
      return { ...state, queue: action.queue };
    case "ADD_REACTION":
      return { ...state, reactions: [...state.reactions, action.reaction].slice(-40) };
    case "REMOVE_REACTION":
      return { ...state, reactions: state.reactions.filter((reaction) => reaction.id !== action.id) };
    case "SET_TYPING":
      return { ...state, typingUsers: action.users };
    default:
      return state;
  }
}

export const initialRoomState = {
  room: null,
  syncState: null,
  messages: [],
  queue: [],
  reactions: [],
  typingUsers: []
};
