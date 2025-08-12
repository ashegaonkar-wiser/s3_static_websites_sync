// This is the iframe script file
console.log('Iframe script loaded');
document.addEventListener('DOMContentLoaded', function() {
    const p = document.createElement('p');
    p.textContent = 'Iframe script executed successfully';
    p.style.color = 'green';
    document.body.appendChild(p);
});
