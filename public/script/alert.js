var interval = setTimeout(timeout, 5000); function timeout() { document.querySelector('.alert').style.display = 'none'; }; document.querySelector('.alert-close').addEventListener('click', function() { document.querySelector('.alert').style.display = 'none'; } );