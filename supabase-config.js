// Конфигурация Supabase
const SUPABASE_URL = 'https://wbxghrubidhabvbqmomt.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_FD_xaxlIqD4rVnRTMsdC_Q_OfNBaiqu'

// Создание клиента Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Экспорт для использования
window.supabaseClient = supabase