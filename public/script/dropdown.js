document.querySelector(".drop").addEventListener("click", function(){ this.classList.toggle("active"); document.querySelector(".drop-two").classList.remove("active"); }); document.querySelector(".drop-two").addEventListener("click", function(){ this.classList.toggle("active"); document.querySelector(".drop").classList.remove("active"); });