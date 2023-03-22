function makeBigger() {
    document.getElementById('textarea').style.fontSize = "4em";
}
function makeFancy() {
    let ta = document.getElementById('textarea');
    ta.style.color = "blue";
    ta.style.fontWeight = "bold";
    ta.style.textDecoration = "underline";
    alert("fancified");
}
function makeBoring() {
    let ta = document.getElementById('textarea');
    ta.style.color = "black";
    ta.style.fontWeight = "400";
    ta.style.textDecoration = "none";
    alert("borinified");
}
function moo() {
    let ta = document.getElementById('textarea');
    ta.style.textTransform = "uppercase";
    var lines = ta.value.split("\n");
    for(let i = 0; i < lines.length; i++) {
        lines[i] = lines[i] + "-Moo";
    }
    ta.value = lines.join("\n");
}