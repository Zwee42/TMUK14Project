
const deleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;
  
    const email = localStorage.getItem('userEmail'); 
  
    if (!email) {
      alert('No email found, please login again');
      return;
    }
  
    const res = await fetch('/api/deleteUser', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      alert('Account deleted successfully');
      localStorage.removeItem('userEmail'); 
    } else {
      alert('Failed to delete account: ' + data.error);
    }
  };
 