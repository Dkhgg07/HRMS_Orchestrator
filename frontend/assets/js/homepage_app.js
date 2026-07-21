// Initialize home page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles
    initializeParticles();
});

function initializeParticles() {
    /* Particles config */
    particlesJS("particles-js", {
    "particles": {
        "number": {"value": 72, "density": {"enable": true, "value_area": 900}},
        "color": {"value": "#000"},
        "shape": {"type": "circle"},
        "opacity": {"value": 0.55, "random": false},
        "size": {"value": 3, "random": true},
        "line_linked": {"enable": true, "distance": 140, "color": "#000", "opacity": 0.35, "width": 1},
        "move": {"enable": true, "speed": 2.5, "direction": "none", "random": false, "straight": false, "out_mode": "out"}
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {"onhover": {"enable": true, "mode": "grab"}, "onclick": {"enable": true, "mode": "push"}, "resize": true},
        "modes": {"grab": {"distance": 140, "line_linked": {"opacity": 0.7}}, "push": {"particles_nb": 4}}
    },
    "retina_detect": true
    });
}