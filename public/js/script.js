
window.onload = function(){
    alert("인물이 두명 이상인 사진, 혹은 인물 사진이 아닐 경우 분석이 안될 수 있으니 유의 해주세요!");

}

document.addEventListener('DOMContentLoaded', function() {
    let imageInput = document.getElementById('imageInput');
    let fileStatus = document.getElementById('fileStatus');
    let imagePreview = document.getElementById('imagePreview');

    imageInput.addEventListener('change', function() {
        if (imageInput.files.length > 0) {
            let file = imageInput.files[0];
            fileStatus.textContent = file.name;

            let reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            fileStatus.textContent = 'No files have been selected';
            imagePreview.style.display = 'none';
            imagePreview.src = '';
        }
    });
});


document.getElementById('generate-pdf').addEventListener('click', async () => {
    const content = document.getElementById('messageArea');

    // Calculate the scale factor based on the content height and A4 page height
    const pageHeight = 297; // A4 page height in mm
    const contentHeight = content.scrollHeight;
    const scaleFactor = pageHeight / (contentHeight * 0.264583); // Convert content height from px to mm (1px = 0.264583mm)

    html2canvas(content, {
        scale: 2, // Scale factor to improve resolution
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.scrollHeight,
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        const imgWidth = 210; // Width in mm (A4)
        const imgHeight = canvas.height * imgWidth / canvas.width;

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        // Add the image to the PDF
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Save the PDF
        doc.save('capture.pdf');
    });
});














// document.addEventListener('DOMContentLoaded', (event) => {
//     // Optionally, display an initial message from Professor Fish if needed
//     // displayMessage("=====================", "assistant");
//
//     // Listen for Enter key presses on the chat input field
//     document.getElementById('chatInput').addEventListener('keypress', function(e) {
//         if (e.key === 'Enter') {
//             e.preventDefault(); // Prevent the default action to avoid form submission
//             sendMessage(); // Trigger the sendMessage function
//         }
//     });
// });

const texts = ["LOADING", "이미지 분석 중...", "ANALYZING Image", "향료 추출 중...", "EXTRACTING Fragrances", "향수 이름 작명 중...", "MAKING Scent name", "Wait a minute", "곧 분석보고서가 나옵니다", "잠시만 기다려주세요"];
let index = 0;

function changeText() {
    const loadingTextDiv = document.getElementById('loadingText');
    loadingTextDiv.textContent = texts[index];
    // Increment the index and reset to 0 if it's at the end of the list
    index = (index + 1) % texts.length;
}

// Call changeText every 3 seconds (3000 milliseconds)
setInterval(changeText, 3000);

let userMessages = [];
let assistantMessages = [];

// Variable for start function
let myDateTime = '';
async function codeSubmit() {
    const passcode = document.getElementById('passcode').value;

    try {
        const response = await fetch('/imageMaster/passcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ passcode }),
        });

        if (!response.ok) {
            alert('이미지 처리 중 문제가 발생했습니다.');
            backToPage();
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        // Show loading
        pageTransition('loader');
        document.getElementById('security').style.display = 'none';

        setTimeout(() => {
            // Check passcode based on the server response
            if (responseData.status === 'validated') { // Passcode validated and updated
                // Hide loading and show intro
                document.getElementById('loader').style.display = 'none';
                pageTransition('intro');
            } else if (responseData.status === 'already_used') { // Passcode already used
                // Hide loading and show alert
                document.getElementById('loader').style.display = 'none';
                document.getElementById('security').style.display = 'flex';
                alert('Passcode already used');
            } else {
                // Hide loading and show alert
                document.getElementById('loader').style.display = 'none';
                document.getElementById('security').style.display = 'flex';
                alert('Wrong passcode');
            }
        }, 2000); // Simulating a delay for the validation process
    } catch (error) {
        console.error('Error:', error);
        alert('이미지 처리 중 문제가 발생했습니다.');
        backToPage();
    }
}


// function start() {
//     const date = document.getElementById('date').value;
//     const hour = document.getElementById('hour').value;
//     // if (date === '') {
//     //     alert('생년월일을 입력해주세요.');
//     //     return;
//     // }
//     myDateTime = date + ' ' + hour; // Assuming you want to include a space or some delimiter
//     console.log(myDateTime);
//
//     let todayDateTime = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
//     let initialAssistantMessage = `포터 선생: 너 ${myDateTime}에 태어났다는 거지? 오늘은 ${todayDateTime}이구나, 자, 운세에 대해서 어떤 것이든 물어보렴.`;
//
//     displayMessage(initialAssistantMessage, "assistant");
//
//     document.getElementById("intro").style.display = "none";
//     document.getElementById("report").style.display = "block";
// }
function imageUpload() {
    const imageCheck = document.getElementById('imageInput');
    const birthInput = document.getElementById('date');
    const inputName = document.getElementById('nameInput');
    const inputGender = document.getElementById('gender');

    // Check if the name input is empty
    if (!inputName.value.trim()) {
        alert('Please enter your name.');
        inputName.focus();
        return;
    }

    // Check if the birthdate input is empty
    if (!birthInput.value.trim()) {
        alert('Please enter your birth date.');
        birthInput.focus();
        return;
    }

    // Check if the gender has been selected
    if (!inputGender.value.trim()) {
        alert('Please select your gender.');
        inputGender.focus();
        return;
    }

    // Check if an image has been uploaded
    if (imageCheck.files.length === 0) {
        alert('Please select an image to upload.');
        imageCheck.focus();
        return;
    }

    // transitionToIntro(); // Transition the UI to the next step
    document.getElementById("intro").style.display = "none";
    sendImage();
}

function pageTransition(id) {
    let displayType = id === "intro" || "security" ? "flex" : "block";
    document.getElementById(`${id}`).style.display = `${displayType}`;
}
// function backToMain() {
//     // Correct the ID if it's 'messageArea' and not 'message-area'
//     const targetArea = document.getElementById('targetTopNote');
//     // cleaningPage(document.getElementById('userName'));
//     cleaningPage(document.getElementById('targetInsight'));
//     cleaningPage(document.getElementById('targetTopNote'));
//     cleaningPage(document.getElementById('targetMiddleNote'));
//     cleaningPage(document.getElementById('targetBaseNote'));
//     cleaningPage(document.getElementById('targetNameRecommend'));
//     // if (targetArea) {
//     //     target.innerHTML = '';
//     //     document.getElementById("report").style.display = "none";
//     //     document.getElementById("intro").style.display = "flex";
//     // } else {
//     //     console.error('Message area element not found');
//     // }
//     // resetPage();
//     document.getElementById("report").style.display = "none";
//     document.getElementById("intro").style.display = "flex";
// }

function backToPage() {
    window.location.href = "https://acscent.co.kr";
}

function displayUserName(name) {
    const userNameElement = document.getElementById('userName');
    userNameElement.textContent = name; // Safely add text content
}

function cleaningPage(tagId) {
    if (tagId) {
        tagId.innerHTML = '';

    } else {
        console.error('Message area element not found');
    }
}
function resetPage() {
    const insightArea = document.getElementById('targetInsight');
    insightArea.textContent = '이미지 분석 결과';
    const topArea = document.getElementById('targetTopNote');
    topArea.style.fontFamily = 'BM Hanna Pro, sans-serif';
    topArea.textContent = `TOP NOTE | `;
    const middleArea = document.getElementById('targetMiddleNote');
    middleArea.style.fontFamily = 'BM Hanna Pro, sans-serif';
    middleArea.textContent = 'MIDDLE NOTE | ';
    const baseArea = document.getElementById('targetBaseNote');
    baseArea.style.fontFamily = 'BM Hanna Pro, sans-serif';
    baseArea.textContent = 'BASE NOTE | ';

}

async function sendImage() {
    const birthInput = document.getElementById('date');
    const inputName = document.getElementById('nameInput');
    const inputGender = document.getElementById('gender');
    const imageInput = document.getElementById('imageInput');
    // console.log("can you get this?: " + birthInput.value);
    if (imageInput.files.length === 0) {
        alert('Please select an image to upload.');
        return;
    }

    function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: file.type }));
                        } else {
                            reject(new Error('Canvas is empty'));
                        }
                    }, file.type, quality);
                };

                img.onerror = (error) => {
                    reject(error);
                };
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    }

    const imageFile = imageInput.files[0];

    try {
        const compressedFile = await compressImage(imageFile);

        const formData = new FormData();
        formData.append('image', compressedFile); // Append the compressed file
        formData.append('gender', inputGender.value === "00" ? '남자' : '여자');
        formData.append('birthDate', birthInput.value);
        formData.append('name', inputName.value);
        // console.log("hello there" + document.getElementById('date').value);

        document.getElementById('loader').style.display = "flex"; // Show loading icon
        document.getElementById('backButton').style.display = "none"; // Hide back button

        const response = await fetch('/imageMaster/image', {
            // local: http://localhost:3003/imageMaster/image
            // http://neander-perfume-maker-recommend-env.eba-dzkzephp.ap-northeast-2.elasticbeanstalk.com/imageMaster/image
            method: 'POST',
            // Don't set 'Content-Type': 'application/json' for FormData
            body: formData,
        });

        if (!response.ok) {
            alert('이미지 처리 중 문제가 발생했습니다.');
            backToPage();
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        // console.log("this is the answer: ", responseData);
        // console.log("target input name" + inputName.value);
        if (responseData.message.nameRecommendation === 'Name Recommendation not found') {
            alert("허용하지 않는 이미지 유형입니다.");
            window.location.href = "https://acscent.co.kr";
        }

        pageTransition("report");
        // console.log('hello' + responseData.message.combinedInsights);
        displayReport(responseData.message.combinedInsights, "testing", 'targetInsight');
        displayReport(responseData.message.topNote, "testing", 'targetTopNote');
        displayReport(responseData.message.middleNote, "testing", 'targetMiddleNote');
        displayReport(responseData.message.baseNote, "testing", 'targetBaseNote');
        displayReport(responseData.message.nameRecommendation, "testing", 'targetNameRecommend');

        imageInput.value = '';
    } catch (error) {
        console.error('Error:', error);
        displayMessage("Error: Could not upload the image. Please try again.", "error");
    } finally {
        // document.getElementById('loader').style.display = "none"; // Hide loading icon
        // document.getElementById('backButton').style.display = "block"; // Show back button
        const loader = document.getElementById('loader');
        const backButton = document.getElementById('backButton');

        loader.classList.add('hidden'); // Add the hidden class to trigger fade-out

        // Wait for the transition to complete before setting display to none
        loader.addEventListener('transitionend', function handleTransitionEnd() {
            loader.style.display = "none"; // Hide loading icon
            loader.classList.remove('hidden'); // Remove the hidden class so it can be used again
            loader.removeEventListener('transitionend', handleTransitionEnd); // Clean up the event listener
        });

        backButton.style.display = "block"; // Show back button
    }
}



// async function sendMessage() {
//     const input = document.getElementById('chatInput');
//     const message = input.value.trim(); // Get the message from the input and trim whitespace
//     if (!message) return; // Do nothing if the message is empty
//
//     displayMessage(`You: ${message}`, "user");
//     userMessages.push(message);
//
//     document.getElementById('loader').style.display = "flex"; // Show loading icon
//
//     try {
//         const response = await fetch('http://localhost:3003/imageMaster/image', {
//
//             //http://localhost:3003/imageMaster/image //for local test
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 myDateTime: myDateTime,
//                 userMessages: userMessages,
//                 assistantMessages: assistantMessages,
//             }),
//         });
//
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//
//         const responseData = await response.json();
//         displayMessage(`포터 선생: ${responseData.assistant}`, "assistant");
//         assistantMessages.push(responseData.assistant);
//     } catch (error) {
//         console.error('Error:', error);
//         displayMessage("Error: Could not get a response. Please try again.", "error");
//     } finally {
//         document.getElementById('loader').style.display = "none"; // Hide loading icon after the operation
//         input.value = ''; // Clear the input field
//     }
// }


function displayMessage(message, sender) {
    const messageArea = document.getElementById('messageArea');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = sender;
    messageElement.style.marginBottom = '5px'; // Add margin between messages
    messageElement.style.fontSize = '30px';
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight; // Scroll to the bottom to show the latest message
}




function displayReport(message, sender, targetID, ) {

    const targetArea = document.getElementById(targetID);
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = sender;
    // messageElement.style.marginBottom = '5px'; // Add margin between messages
    // messageElement.style.marginTop = '20px';
    if (targetID === 'targetNameRecommend') {
        messageElement.style.fontSize = '32px';
        messageElement.style.color = 'white';
    } else {
        messageElement.style.fontSize = '16px';
    }
    targetArea.appendChild(messageElement);
    targetArea.scrollTop = targetArea.scrollHeight; // Scroll to the bottom to show the latest message

}
