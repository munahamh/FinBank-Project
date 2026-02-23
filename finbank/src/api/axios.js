import axios from 'axios';

// إنشاء نسخة مخصصة من axios مع الرابط الأساسي للسيرفر الخاص بكِ
const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // هذا هو الرابط الذي بنيناه
});

// إضافة "مُعترض" (Interceptor) ليقوم بإرفاق التوكن تلقائياً مع كل طلب
instance.interceptors.request.use(
  (config) => {
    // جلب التوكن من التخزين المحلي للمتصفح (Local Storage)
    const token = localStorage.getItem('token');
    
    // إذا وجد التوكن، يضعه في الـ Headers تماماً كما كنا نفعل في Postman!
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;