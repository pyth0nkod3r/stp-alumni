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

  // 🔴 MOCK: Replace with real API call when backend endpoint is available
  // Expected endpoint: PUT /events/:eventId (multipart/form-data with same fields as create)
  // Expected response: { status: true, message: "Event updated successfully", data: {...} }
  updateEvent: async (eventId, formData) => {
    const response = await api.put(`/events/${eventId}`, formData);
    return response.data;
  },

  // 🔴 MOCK: Replace with real API call when backend endpoint is available  
  // Expected endpoint: DELETE /events/:eventId
  // Expected response: { status: true, message: "Event deleted successfully" }
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },
};

export default eventService;
