import axiosInstance from './axiosInstance';

// --- Service d'Authentification ---
export const authService = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials), // {email, password}
  register: (userData) => axiosInstance.post('/auth/register', userData), // {name, email, password, role?}
  getMe: () => axiosInstance.get('/auth/me'), // Récupère les infos de l'utilisateur connecté
};

// --- Service Utilisateurs (Admin) ---
export const userService = {
  getAllUsers: () => axiosInstance.get('/users'),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  updateUser: (id, data) => axiosInstance.put(`/users/${id}`, data),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
};

// --- Service Cours ---
export const courseService = {
  getAllCourses: () => axiosInstance.get('/courses'),
  getCourseById: (id) => axiosInstance.get(`/courses/${id}`),
  createCourse: (courseData) => axiosInstance.post('/courses', courseData), // { title, code, description, professorId }
  updateCourse: (id, courseData) => axiosInstance.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => axiosInstance.delete(`/courses/${id}`),
  enrollCourse: (id) => axiosInstance.post(`/courses/${id}/enroll`),
  unenrollCourse: (id) => axiosInstance.delete(`/courses/${id}/unenroll`),
};

// --- Service Notes ---
export const gradeService = {
   assignOrUpdateGrade: (gradeData) => axiosInstance.post('/grades', gradeData), // { studentId, courseId, gradeValue }
   getGradesByStudent: (studentId) => axiosInstance.get(`/grades/student/${studentId}`),
   getGradesByCourse: (courseId) => axiosInstance.get(`/grades/course/${courseId}`),
   deleteGrade: (gradeId) => axiosInstance.delete(`/grades/${gradeId}`),
};