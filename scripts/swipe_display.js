/*
A prototype script for displaying a story one paragraph at a time, responding
to a swipe or arrow key from the user. 

Main code is located at very bottom of the file, with plentiful helper methods
above it.
*/

maxParLen = -1;
tapRegion = 1/3;

titleId = "title";
authorId = "author";
secondTitleId = "secondTitle";
secondAuthorId = "secondAuthor";
storyId = "story";
detailId = "copyright";
helpId = "help";
backId = "backlink";

storyData = {
    "ccs": {
        "title": hemingwayTitle,
        "author": hemingwayAuthor,
        "copyright": hemingwayCopyright,
        "body": hemingwayBody,
        "delimiter": "</p><p>"
    },
    "agmihtf": {
        "title": oconnorTitle,
        "author": oconnorAuthor,
        "copyright": oconnorCopyright,
        "body": oconnorText,
        "delimiter": "</p><p>"
    },
    "bti": {
        "title": gloverTitle,
        "author": gloverAuthor,
        "copyright": gloverCopyright,
        "body": gloverText,
        "delimiter": "\n"
    }
};

swipeThreshold = 35

/*
behaves as getElementById, intended to make it easier to switch from
vanilla to another library
*/
function getElementById(id) {
    return document.getElementById(id);
}

/*
get query parameter or request parameter to tell what page we're on
could be invalid

returns null if none exists
*/
function getPageParam(pageParam) {
    var pageParamName = 'story'
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(pageParamName);
}

/*
returns whether the given page parameter is valid
input could be null
*/
function isValidParam(pageParam) {
    if (pageParam == null) {
        return false;
    }
    return (pageParam in storyData);
}

/*
precondition: current page parameter is invalid

could redirect to 404 or display content to user
*/
function handleInvalidParam() {
    var invalidTitle = "Story Not Found";
    var invalidParagraph = "Sorry, the story you're looking for doesn't exist currently."
    getElementById(titleId).innerHTML = invalidTitle;
    getElementById(storyId).innerHTML = invalidParagraph;
}

/*
if wantHide, hides menu
otherwise, shows menu
*/
function toggleShowMenu(wantHide) {
    hideableFields = [titleId, detailId, authorId];
    for (var i = 0; i < hideableFields.length; i++) {
        getElementById(hideableFields[i]).hidden = wantHide;
    }   
}

/*
precondition: given page parameter is valid ie. corresponds to a story we have

will eventually move onto server side

return a list of paragraphs for the given page parameter, intended to 
be viewed one at a time
*/
function getParagraphs(pageParam) {
    var memoKey = "paragraphs"
    if (storyData[pageParam][memoKey]) {
        return storyData[pageParam][memoKey];
    }
    var longPars = storyData[pageParam]["body"].split(storyData[pageParam]["delimiter"]);
    if (maxParLen > 0) {
        var shortPars = []
        for (var i = 0; i < longPars.length; i++) {
            for (var j = 0; j < longPars[i].length; ) {
                var nextPar = longPars[i].substring(j,Math.min(j+maxParLen,longPars[i].length))
                shortPars.push(nextPar)
                j += maxParLen;
            }
        }
        storyData[pageParam][memoKey] = shortPars; 
        return shortPars;
    } else {
        storyData[pageParam][memoKey] = longPars
    }
    return longPars;
}

/*
precondition: given page parameter is valid ie. corresponds to a story we have

will eventually move onto server side

return title of the story for given parameter
*/
function getTitle(pageParam) {
    return storyData[pageParam]["title"];
}

/*
precondition: given page parameter is valid ie. corresponds to a story we have

will eventually move onto server side

return author of the story for given parameter
*/
function getAuthor(pageParam) {
    return storyData[pageParam]["author"];
}

/*
precondition: given page parameter is valid ie. corresponds to a story we have

will eventually move onto server side

return copyright of the story for given parameter
*/
function getCopyright(pageParam) {
    return storyData[pageParam]["copyright"];
}

/*
precondition: onMobile is true iff the user is viewing the page on mobile

display dialogue cluing user about how to view next paragraph
*/
function displayHelpDialogue(onMobile) {
    var helpString;
    if (onMobile) {
        // helpString = "Swipe left and right between paragraphs."
        helpString = "Tap left and right between paragraphs."
    } else {
        helpString = "Use left and right arrow keys to change paragraphs."
    }
    getElementById(helpId).innerHTML = helpString;
}

/*
show cookie dialogue asking for permission
*/
function displayCookieDialogue() {

}

/*
returns a standardized name for the given story
*/
function getCookieName(pageParam) {
    return pageParam.concat("CurrentParagraphCookie")
}

/*
precondition: index is valid for the given pageParam
pageParam is a valid page parameter

*/
function setCurrentParagraphCookie(pageParam, index) {
    document.cookie = getCookieName(pageParam).concat("=")+index;
}

/*
source: https://www.w3schools.com/js/js_cookies.asp

get the value of a cookie with a given name, if none exists return null
*/
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

/*
checks cookie for given page, returns null if none exists

NOTE: doesn't check if pageParam is valid
*/
function getCurrentParagraphCookie(pageParam) {
    var cookieStr = getCookie(getCookieName(pageParam));
    if (cookieStr != null) {
        return parseInt(cookieStr);
    }
    return null;
}

/*
returns index previously used in setCurrentParagraphCookie with given parameter.
if none was set, sets the cookie to 0 and returns 0.

NOTE: doesn't check if pageParam is valid
*/
function safeGetCurrentParagraph(pageParam) {
    var currParagraph = getCurrentParagraphCookie(pageParam);
    if (!currParagraph) {
        setCurrentParagraphCookie(pageParam, 0);
        currParagraph = 0;
    }
    return currParagraph;
}

/*
precondition: index is valid for the given pageParam
pageParam is a valid page parameter

saves the current paragraph for given page, abstract storage method
*/
function safeSetCurrentParagraph(pageParam, index) {
    setCurrentParagraphCookie(pageParam, index);
}

/*
displays a given paragraph with no validation on text
scrolls to top of the window
*/
function displayStoryText(text) {
    getElementById(storyId).innerHTML = text;
    window.scrollTo(0,0);
}

/*
    precondition: pageParam valid, index valid for given story

    displays the given paragraph from the given story. iff store set to true,
    also sets the current paragraph to this index

    do nothing if index is not valid for given paragraph
*/
function displayParagraph(pageParam, index, store) {
    var paragraphs = getParagraphs(pageParam);
    if (index >= 0 && index < paragraphs.length) {
        if (store) {
            safeSetCurrentParagraph(pageParam, index);
        }
        displayStoryText(paragraphs[index]);
    }
    if (index > 0) {
        toggleShowMenu(true);
    } else {
        toggleShowMenu(false);
    }
}

/*
precondition: pageParam is valid, current paragraph is set to a valid index
for this story

displays next paragraph based on cookie (or previous paragraph iff wantNext is false)
if at end or beginning of story do nothing
*/
function changeParagraph(pageParam, wantNext) {
    var currParagraph = safeGetCurrentParagraph(pageParam);
    if (wantNext) {
        displayParagraph(pageParam, currParagraph+1, true);
    } else {
        displayParagraph(pageParam, currParagraph-1, true);
    }
}

//see changeParagraph
function displayNextParagraph(pageParam) {
    changeParagraph(pageParam, true);
}

//see changeParagraph
function displayPreviousParagraph(pageParam) {
    changeParagraph(pageParam, false);
}

/*
precondition: pageParam is valid

sets the title of the page to that of the given story
as well as the copyright info
*/
function populateTitle(pageParam) {
    getElementById(titleId).innerHTML = getTitle(pageParam);
    getElementById(secondTitleId).innerHTML = getTitle(pageParam);
    getElementById(detailId).innerHTML = getCopyright(pageParam);

    getElementById(authorId).innerHTML = getAuthor(pageParam);
    getElementById(secondAuthorId).innerHTML = getAuthor(pageParam);
}

/*
precondition: pageParam is valid and user is on mobile

register events for swiping horizontally (change paragraphs)
and vertically (toggle menu)

https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
*/
// function registerSwipeEvents(pageParam) {
//     document.addEventListener('touchstart', handleTouchStart, false);        
//     document.addEventListener('touchmove', handleTouchMove, false);

//     var xDown = null;                                                        
//     var yDown = null;

//     function getTouches(evt) {
//       return evt.touches ||             // browser API
//              evt.originalEvent.touches; // jQuery
//     }                                                     

//     function handleTouchStart(evt) {
//         const firstTouch = getTouches(evt)[0];                                      
//         xDown = firstTouch.clientX;                                      
//         yDown = firstTouch.clientY;                                      
//     };                                                

//     function handleTouchMove(evt) {
//         if ( ! xDown || ! yDown ) {
//             return;
//         }

//         var xUp = evt.touches[0].clientX;                                    
//         var yUp = evt.touches[0].clientY;

//         var xDiff = xDown - xUp;
//         var yDiff = yDown - yUp;

//         if (Math.abs(xDiff) < swipeThreshold && Math.abs(yDiff) < swipeThreshold) {
//             return;
//         }

//         if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
//             if ( xDiff > 0 ) {
//                 displayNextParagraph(pageParam);
//             } else {
//                 displayPreviousParagraph(pageParam);
//             }                       
//         } else {
//             if ( yDiff > 0 ) {
//                 // toggleShowMenu(true);
//             } else { 
//                 // toggleShowMenu(false);
//             }                                                                 
//         }
//         /* reset values */
//         xDown = null;
//         yDown = null;                                             
//     };
// }

// /**
// precondition: on mobile page

// registers when mobile user taps on certain side of screen to switch paragraphs
// */
// function registerTapEvents(pageParam) {
//     document.addEventListener('touchstart', handleTouchStart, false);        
//     document.addEventListener('touchend', handleTouchEnd, false);

//     var xDown = null;                                                        
//     var yDown = null;

//     function getTouches(evt) {
//       return evt.touches ||             // browser API
//              evt.originalEvent.touches; // jQuery
//     }                                                     

//     function handleTouchStart(evt) {
//         const firstTouch = getTouches(evt)[0];                                      
//         xDown = firstTouch.clientX;                                      
//         yDown = firstTouch.clientY;                                      
//     };                                                

//     function handleTouchEnd(evt) {
//         if ( ! xDown || ! yDown ) {
//             return;
//         }

//         // source: https://stackoverflow.com/questions/1248081/how-to-get-the-browser-viewport-dimensions
//         const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
//         const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

//         var xUp = evt.touches[0].clientX;                                    
//         var yUp = evt.touches[0].clientY;

//         if (xDown > vw*(1-tapRegion) && xUp > vw*(1-tapRegion)) {
//             displayNextParagraph(pageParam);
//         } else if (xDown < vw*tapRegion && xUp < vw*tapRegion) {
//             displayPreviousParagraph(pageParam);
//         }

//         /* reset values */
//         xDown = null;
//         yDown = null;                                             
//     };
// }

/**
precondition: on mobile page

registers when mobile user taps on certain side of screen to switch paragraphs
*/
function registerTapEvents2(pageParam) {
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);        

    var xDown = null;
    var yDown = null; 

    function getTouches(evt) {
      return evt.touches ||             // browser API
             evt.originalEvent.touches; // jQuery
    }                                                    

    function handleTouchStart(evt) {
        const firstTouch = getTouches(evt)[0];                                      
        xDown = firstTouch.clientX;                                      
        yDown = firstTouch.clientY;
    }

    function handleTouchMove(evt) {
        const firstTouch = getTouches(evt)[0];                                      
        var xMove = firstTouch.clientX;                                      
        var yMove = firstTouch.clientY;
        if (xDown || yDown) {
            if (Math.abs(xMove-xDown) > swipeThreshold || 
                Math.abs(yMove-yDown) > swipeThreshold) {
                xDown = null;
                yDown = null;
            }
        }
    }

    function handleTouchEnd(evt) {
        getElementById(storyId).innerHTML = 'start';
        if (!xDown || !yDown) {
            getElementById(storyId).innerHTML = 'cancel';
            return;
        }
        getElementById(storyId).innerHTML = evt.toString();                                
        const firstTouch = getTouches(evt)[0];   
        getElementById(storyId).innerHTML = firstTouch.toString();                                
        var xUp = firstTouch.clientX;                                      
        var yUp = firstTouch.clientY;


        // source: https://stackoverflow.com/questions/1248081/how-to-get-the-browser-viewport-dimensions
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        getElementById(storyId).innerHTML = xUp.toString()+", "+(vw*(1-tapRegion))+", "+(vw*tapRegion);

        if (xUp > vw*(1-tapRegion)) {
            displayNextParagraph(pageParam);
        } else if (xUp < vw*tapRegion) {
            displayPreviousParagraph(pageParam);
        }
    }                                
}

/*
Precondition: user should be on web and pageParam is valid

Source: https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript

Allow switching between paragraphs and hiding menu for arrow keys (on web)
*/
function registerArrowKeys(pageParam) {
    document.onkeydown = checkKey;

    function checkKey(e) {

        e = e || window.event;

        if (e.keyCode == '38') {
            // toggleShowMenu(false);
        }
        else if (e.keyCode == '40') {
            // toggleShowMenu(true);
        }
        else if (e.keyCode == '37') {
            displayPreviousParagraph(pageParam);
        }
        else if (e.keyCode == '39') {
            displayNextParagraph(pageParam);
        }
    }
}

/*
    source: https://www.cssscript.com/basic-hamburger-toggle-menu-css-vanilla-javascript/
*/
function registerHamburger() {

  var hamburger = {
    navToggle: document.querySelector('.nav-toggle'),
    nav: document.querySelector('nav'),

    doToggle: function(e) {
      e.preventDefault();
      this.navToggle.classList.toggle('expanded');
      this.nav.classList.toggle('expanded');
    }
  };

  hamburger.navToggle.addEventListener('click', function(e) { hamburger.doToggle(e); });
  hamburger.nav.addEventListener('click', function(e) { hamburger.doToggle(e); });

}

/*
    Source: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

    returns whether current user is on mobile (this includes tablet) or not
*/
function isMobilePage() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

var pageParam = getPageParam();

if (isValidParam(pageParam)) {
    displayCookieDialogue();
    populateTitle(pageParam);

    var onMobile = isMobilePage();
    displayHelpDialogue(onMobile);

    if (onMobile) {
        registerTapEvents2(pageParam);
    } else {
        registerArrowKeys(pageParam);
    }
    registerHamburger();
    var currPar = safeGetCurrentParagraph(pageParam);
    displayParagraph(pageParam, currPar, false);

} else {
    handleInvalidParam();
}