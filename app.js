// app.js – Supabase version

// 1. Supabase config – REPLACE with your own
// Get these from Supabase: Settings -> API
const SUPABASE_URL = 'https://zngoaecsdpyyprrnluza.supabase.co';        // your URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ29hZWNzZHB5eXBycm5sdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk3NjIsImV4cCI6MjA4NTc5NTc2Mn0.boZ5F4ZQcIantpdaiSmaUeBTPE_moDmu60j3I8sXKNk';                 // replace this

// 2. Initialize Supabase client (global variable)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. Helper: show status messages
function setStatus(message) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) statusDiv.textContent = message;
}

function setAdminStatus(message) {
  const statusDiv = document.getElementById('admin-status');
  if (statusDiv) statusDiv.textContent = message;
}

// 4. Handle customer upload form
async function handleOrderSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('customerName');
  const emailInput = document.getElementById('customerEmail');
  const phoneInput = document.getElementById('customerPhone');
  const frontInput = document.getElementById('frontImage');
  const backInput = document.getElementById('backImage');

  const customerName = nameInput.value.trim();
  const customerEmail = emailInput.value.trim();
  const customerPhone = phoneInput.value.trim();
  const frontFile = frontInput.files[0];
  const backFile = backInput.files[0];

  if (!customerName || !customerEmail || !frontFile || !backFile) {
    setStatus("Please fill in name, email and select both images.");
    return;
  }

  if (!customerEmail.includes("@")) {
    setStatus("Please enter a valid email address.");
    return;
  }

  // Generate a unique order ID, e.g. KC-<timestamp>-ABCDE
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const orderId = `KC-${timestamp}-${randomPart}`;

  try {
    setStatus("Uploading images, please wait...");

    const timestampUpload = Date.now();

    // Paths inside the 'orders' bucket
    const frontPath = `orders/${orderId}/front_${times
