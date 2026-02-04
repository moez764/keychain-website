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

  const orderNumberInput = document.getElementById('orderNumber');
  const frontInput = document.getElementById('frontImage');
  const backInput = document.getElementById('backImage');

  const orderNumber = orderNumberInput.value.trim();
  const frontFile = frontInput.files[0];
  const backFile = backInput.files[0];

  if (!orderNumber || !frontFile || !backFile) {
    setStatus("Please fill all fields and select both images.");
    return;
  }

  try {
    setStatus("Uploading images, please wait...");

    const timestamp = Date.now();

    // Paths inside the 'orders' bucket
    const frontPath = `orders/${orderNumber}/front_${timestamp}_${frontFile.name}`;
    const backPath  = `orders/${orderNumber}/back_${timestamp}_${backFile.name}`;

    // Upload front image
    const { data: frontData, error: frontError } = await supabaseClient
      .storage
      .from('orders')   // bucket name
      .upload(frontPath, frontFile);

    if (frontError) {
      console.error(frontError);
      setStatus("Error uploading front image.");
      return;
    }

    // Upload back image
    const { data: backData, error: backError } = await supabaseClient
      .storage
      .from('orders')
      .upload(backPath, backFile);

    if (backError) {
      console.error(backError);
      setStatus("Error uploading back image.");
      return;
    }

    // Insert order record into 'orders' table
    const { error: insertError } = await supabaseClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        front_path: frontPath,
        back_path: backPath
        // created_at will use default now()
      });

    if (insertError) {
      console.error(insertError);
      setStatus("Error saving order data.");
      return;
    }

    setStatus("Upload successful! Thank you.");
    orderNumberInput.value = "";
    frontInput.value = "";
    backInput.value = "";
  } catch (err) {
    console.error(err);
    setStatus("Unexpected error. Please try again later.");
  }
}

// 5. Load orders for admin page
async function loadOrders() {
  try {
    setAdminStatus("Loading orders...");
    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) return;

    tbody.innerHTML = "";

    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setAdminStatus("Error loading orders.");
      return;
    }

    if (!data || data.length === 0) {
      setAdminStatus("No orders found yet.");
      return;
    }

    for (const row of data) {
      const tr = document.createElement('tr');

      const orderTd = document.createElement('td');
      orderTd.textContent = row.order_number || "(no number)";
      tr.appendChild(orderTd);

      // Build public URLs for images
      const { data: frontUrlData } = supabaseClient
        .storage
        .from('orders')
        .getPublicUrl(row.front_path);

      const { data: backUrlData } = supabaseClient
        .storage
        .from('orders')
        .getPublicUrl(row.back_path);

      const frontTd = document.createElement('td');
      const frontImg = document.createElement('img');
      frontImg.src = frontUrlData.publicUrl;
      frontImg.alt = "Front photo";
      frontTd.appendChild(frontImg);
      tr.appendChild(frontTd);

      const backTd = document.createElement('td');
      const backImg = document.createElement('img');
      backImg.src = backUrlData.publicUrl;
      backImg.alt = "Back photo";
      backTd.appendChild(backImg);
      tr.appendChild(backTd);

      const timeTd = document.createElement('td');
      timeTd.textContent = row.created_at ? new Date(row.created_at).toLocaleString() : "N/A";
      tr.appendChild(timeTd);

      tbody.appendChild(tr);
    }

    setAdminStatus("Orders loaded.");
  } catch (err) {
    console.error(err);
    setAdminStatus("Unexpected error loading orders.");
  }
}
