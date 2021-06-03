const searchbox = document.getElementById('searchbox')
const searchform = document.getElementById('searchform')
console.log(searchbox)
searchbox.onkeypress = function() {
  console.log(searchbox.value)
}
searchform.onsubmit = function() {
  // alert('submiting: ' + (searchbox.value).replace(/\s+/g, ''))
  searchform.action += (searchbox.value).replace(/\s+/g, '')
}