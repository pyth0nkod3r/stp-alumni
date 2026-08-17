import api from '../api/axios';

const eventService = {
  /**
   * Fetch all events.
   */
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },

  /**
   * Fetch a single event by ID.
   * @param {string} eventId 
   */
  getEventById: async (eventId) => {
    const response = await api.get(`/events/${eventId}`);

    // console.log(response.data,"llo4mog")
    return response.data;
  },

  /**
   * Create a new event with form data (including cover image)
   * @param {FormData} formData
   */
  createEvent: async (formData) => {
    const response = await api.post('/events', formData);
    return response.data;
  },

  registerEvent: async (id) => {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },

  /**
   * Cancel event registration
   * @param {string} id - event ID
   */
  cancelRegistration: async (id) => {
    const response = await api.delete(`/events/${id}/register`);
    return response.data;
  },

  /**
   * Fetch registered events for the current user
   */
  getMyEvents: async () => {
    const response = await api.get('/events/mine');
    return response.data;
  },

  /**
   * View event registrants (owner or admin only)
   * @param {string} eventId
   */
  getEventRegistrants: async (eventId) => {
    const response = await api.get(`/events/${eventId}/registrants`);
    return response.data;
  },
};

export default eventService;
