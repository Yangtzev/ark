function checkLogin() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('login-link').innerHTML = '<a href="#" onclick="logout()">登出</a> <span>' + username + '</span>';
    }
}

function logout() {
    localStorage.removeItem('username');
    window.location.reload();
}

window.addEventListener('load', () => {
    document.querySelector('header').style.opacity = '1'; // 确保顶部栏立即可见
    document.body.classList.add('loaded');
});