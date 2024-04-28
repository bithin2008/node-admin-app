/* function ekUpload() {
  function Init() {
    var fileSelect = document.getElementById('file-upload'),
      fileDrag = document.getElementById('file-drag'),
      submitButton = document.getElementById('submit-button');

    fileSelect.addEventListener('change', fileSelectHandler, false);

    // Is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
      // File Drop
      fileDrag.addEventListener('dragover', fileDragHover, false);
      fileDrag.addEventListener('dragleave', fileDragHover, false);
      fileDrag.addEventListener('drop', fileSelectHandler, false);
    }
  }

  function fileDragHover(e) {
    var fileDrag = document.getElementById('file-drag');

    e.stopPropagation();
    e.preventDefault();

    fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
  }

  function fileSelectHandler(e) {
    // Fetch FileList object
    var files = e.target.files || e.dataTransfer.files;

    // Cancel event and hover styling
    fileDragHover(e);

    // Process all File objects
    for (var i = 0, f; f = files[i]; i++) {
      parseFile(f);
      uploadFile(f);
    }
  }

  // Output
  function output(msg) {
    // Response
    var m = document.getElementById('messages');
    m.innerHTML = msg;
  }

  function parseFile(file) {

    console.log(file.name);
    output(
      '<strong>' + encodeURI(file.name) + '</strong>'
    );

    // var fileType = file.type;
    // console.log(fileType);
    var imageName = file.name;

    var isGood = (/\.(?=gif|jpg|png|jpeg|webp)/gi).test(imageName);
    if (isGood) {
      document.getElementById('start').classList.add("hidden");
      document.getElementById('response').classList.remove("hidden");
      document.getElementById('notimage').classList.add("hidden");
      // Thumbnail Preview
      document.getElementById('file-image').classList.remove("hidden");
      document.getElementById('file-image').src = URL.createObjectURL(file);
    }
    else {
      document.getElementById('file-image').classList.add("hidden");
      document.getElementById('notimage').classList.remove("hidden");
      document.getElementById('start').classList.remove("hidden");
      document.getElementById('response').classList.add("hidden");
      document.getElementById("file-upload-form").reset();
    }
  }

  function setProgressMaxValue(e) {
    var pBar = document.getElementById('file-progress');

    if (e.lengthComputable) {
      pBar.max = e.total;
    }
  }

  function updateFileProgress(e) {
    var pBar = document.getElementById('file-progress');

    if (e.lengthComputable) {
      pBar.value = e.loaded;
    }
  }

  function uploadFile(file) {

    var xhr = new XMLHttpRequest(),
      fileInput = document.getElementById('class-roster-file'),
      pBar = document.getElementById('file-progress'),
      fileSizeLimit = 1024; // In MB
    if (xhr.upload) {
      // Check if file is less than x MB
      if (file.size <= fileSizeLimit * 1024 * 1024) {
        // Progress bar
        pBar.style.display = 'inline';
        xhr.upload.addEventListener('loadstart', setProgressMaxValue, false);
        xhr.upload.addEventListener('progress', updateFileProgress, false);

        // File received / failed
        xhr.onreadystatechange = function (e) {
          if (xhr.readyState == 4) {
            // Everything is good!

            // progress.className = (xhr.status == 200 ? "success" : "failure");
            // document.location.reload(true);
          }
        };

        // Start upload
        xhr.open('POST', document.getElementById('file-upload-form').action, true);
        xhr.setRequestHeader('X-File-Name', file.name);
        xhr.setRequestHeader('X-File-Size', file.size);
        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        xhr.send(file);
      } else {
        output('Please upload a smaller file (< ' + fileSizeLimit + ' MB).');
      }
    }
  }

  // Check for the various File API support.
  if (window.File && window.FileList && window.FileReader) {
    Init();
  } else {
    document.getElementById('file-drag').style.display = 'none';
  }
}
ekUpload(); */


// Upload 2 //


//ekUpload2();

// Tooltip //
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

// Tour //
/* var wt = new WebTour();
var steps = [
  {
    content: `<div class="text-center p-3 flow-rootx">
                        <h3 class="text-center h3 fw--b c--blak">Hi, Welcome to your portal</h3>
                        <p class="h7">Let's start a short tour to make you understand your elements</p>
                    </div>`,
    width: '500px'
  },
  {
    element: '#panel',
    title: 'Sidebar Panel',
    content: 'Hi, this is your sidebar panel, you can navigate to pages by clicking links below.',
    placement: 'right-start',
  },
  {
    element: '#message',
    title: 'Message Inbox',
    content: 'Hi, this is your message box, new messages will come here.',
    placement: 'left-start',
  },
  {
    element: '#notification',
    title: 'Notification',
    content: 'Hi, this is your notification box, new activities will show here.',
    placement: 'left-start',
  }, {
    element: '#profile',
    title: 'Profile',
    content: 'Hi, this is your profile, you can edit, logout even you can customize your mode.',
    placement: 'left-start',
  }, {
    element: '#table',
    title: 'Table',
    content: 'Hi, this is your table, lists will be shown here.',
    placement: 'top-start',
  },
  {
    element: '#tablerow',
    title: 'Editable Row',
    content: 'Hi, all these rows of every table are editable, just double click on every column and update your fields accordingly.',
    placement: 'top-start',
  },
  {
    content: `<div class="text-center p-3">
                        <i class="pi pi-thumbs-up"></i>
                        <h3 class="h4">That's the end of our tour! Check-out other features below.</h3>
                    </div>`,
    width: '500px'
  }]
const dashboardWrap= document.getElementById("dashboard-wrap")
if (dashboardWrap) {
  wt.setSteps(steps);
  wt.start();
}
 */


// function fun(e)
// {
//   var container = document.getElementById('brightness');
//   var val = e.value;
//   container.setAttribute("style", "filter: brightness("+val+"%);");
// }

// Brightness Controller //
rangeInput = document.getElementById("range");
if (rangeInput) {
  container = document
    .getElementsByClassName("brightness")[0];

  rangeInput.addEventListener("change", function () {
    container.style.filter = "brightness(" + rangeInput.value + "%)";
  });
}


// Light Mode Dark Mode Controller //

//  function setTheme(themeName) {
//   localStorage.setItem('theme', themeName);
//   document.documentElement.className = themeName;
// }

// function toggleTheme() {
//   if (localStorage.getItem('theme') === 'theme-dark') {
//       setTheme('theme-light');
//   } else {
//       setTheme('theme-dark');
//   }
// }

// (function () {
//   if (localStorage.getItem('theme') === 'theme-dark') {
//       setTheme('theme-dark');
//       document.getElementById('slider').checked = false;
//   } else {
//       setTheme('theme-light');
//     document.getElementById('slider').checked = true;
//   }
// })();

/* global bootstrap: false */

(function () {
  'use strict'

  document.querySelectorAll('[href="#"], [type="submit"]')
    .forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault()
      })
    })

  function setActiveItem() {
    var hash = window.location.hash

    if (hash === '') {
      return
    }

    var link = document.querySelector('.bd-aside a[href="' + hash + '"]')
    
    if (!link) {
      return
    }

    var active = document.querySelector('.bd-aside .active')
    var parent = link.parentNode.parentNode.previousElementSibling

    link.classList.add('active')

    if (parent.classList.contains('collapsed')) {
      parent.click()
    }

    if (!active) {
      return
    }

    var expanded = active.parentNode.parentNode.previousElementSibling

    active.classList.remove('active')

    if (expanded && parent !== expanded) {
      expanded.click()
    }
  }

  setActiveItem()
  window.addEventListener('hashchange', setActiveItem)

  
})()

	


//# sourceURL=pen.js

// Toaster //


let toastTrigger = document.getElementById('liveToastBtn')
let toastLiveExample = document.getElementById('liveToast')
if (toastTrigger) {
  toastTrigger.addEventListener('click', () => {
    let toast = new bootstrap.Toast(toastLiveExample)
    toast.show()
  })
}




// TAB CONTENT

  
// (function () {
//   // hold onto the drop down menu                                             
//   var dropdownMenu;

//   // and when you show it, move it to the body                                     
//   $(window).on('show.bs.dropdown', function (e) {

//       // grab the menu        
//       dropdownMenu = $(e.target).find('.dropdown-menu');

//       // detach it and append it to the body
//       $('body').append(dropdownMenu.detach());

//       // grab the new offset position
//       var eOffset = $(e.target).offset();

//       // make sure to place it where it would normally go (this could be improved)
//       dropdownMenu.css({
//           'display': 'block',
//               'top': eOffset.top + $(e.target).outerHeight(),
//               'left': eOffset.left
//       });
//   });

//   // and when you hide it, reattach the drop down, and hide it normally                                                   
//   $(window).on('hide.bs.dropdown', function (e) {
//       $(e.target).append(dropdownMenu.detach());
//       dropdownMenu.hide();
//   });
// })();


// $(function () {
//   new bootstrap.Dropdown(document.getElementByClassName("dropdown-menu"), {
//       boundary: document.querySelector("body"),
//       popperConfig: function (defaultBsPopperConfig) {
//           return {
//               ...defaultBsPopperConfig,
//               placement: "bottom-end",
//               strategy: "fixed"
//           };
//       }
//   });
// });