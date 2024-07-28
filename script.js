
//LẤY DỮ LIỆU FIREBASE
// URL của Firebase Realtime Database
const databaseURL = "https://xepchugame-default-rtdb.firebaseio.com/";

let linkToFirebaseData; // Định nghĩa biến linkToFirebaseData ở phạm vi toàn cục
 //let correctOrder;


// Hàm callback để xử lý sau khi dữ liệu được thêm vào Firebase thành công
function onDataAdded(newId) {
    // Tạo đường dẫn dựa trên mã đặc biệt và hiển thị nó cho người dùng
    var gameLink = window.location.href.split('?')[0] + '?id=' + newId; // Tạo đường dẫn với mã đặc biệt
    console.log('Dữ liệu đã được thêm vào Firebase. Truy cập đường link sau để chơi trò chơi:\n' + gameLink);
     // Hiển thị đường link trên trang HTML
     var linkContainer = document.getElementById('linkContainer');
     linkContainer.innerHTML = 'Gửi đường link này cho người ấy: <a href="' + gameLink + '">' + gameLink + '</a>';
     linkContainer.style.display = 'block'; // Hiển thị phần tử linkContainer
}

//ẩn phần nhập
document.addEventListener('DOMContentLoaded', function() {
    // Lấy tham số từ URL
    const urlParams = new URLSearchParams(window.location.search);
    // Kiểm tra nếu URL chứa tham số đặc biệt (ví dụ: 'id')
    if (urlParams.has('id')) {
        // Tìm phần tử đầu vào và nút gửi
        const nameInput = document.getElementById('textInput');
        const submitButton = document.getElementById('submitButton');
        // Kiểm tra nếu phần tử tồn tại, sau đó xóa nó
        if (nameInput) {
            nameInput.remove();
        }
        if (submitButton) {
            submitButton.remove();
        }
    }
});


// Lắng nghe sự kiện khi trang web được tải và kiểm tra tham số truy vấn
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        // Nếu có tham số truy vấn "id", hiển thị danh sách từ
        getDataFromFirebaseById(id)
            .then(onDataReceived) // Gọi hàm để hiển thị danh sách từ
            .catch((error) => {
                console.error("Lỗi khi lấy dữ liệu từ Firebase:", error);
            });
    }
});

// Hàm để thêm dữ liệu vào Firebase
async function addDataToFirebase() {
    try {
        const nameInput = document.getElementById("textInput");
        const name = nameInput.value.trim().split(' ').join(''); // Loại bỏ dấu cách từ chuỗi nhập liệu
        if (name !== "") {
            const response = await fetch(databaseURL + "data.json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: name })
            });
            if (!response.ok) {
                throw new Error("Lỗi khi gửi yêu cầu: " + response.status);
            }
            const responseData = await response.json();
            const newKey = responseData.name; // Lấy mã đặc biệt mới được tạo
            console.log("Dữ liệu đã được thêm vào Firebase:", { id: newKey, name: name });

            // Gọi hàm xử lý sau khi dữ liệu được thêm thành công
            onDataAdded(newKey);

            return newKey; // Trả về mã đặc biệt của dữ liệu mới được thêm vào Firebase
        } else {
            console.log("Vui lòng nhập tên trước khi thêm dữ liệu.");
        }
        
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu vào Firebase:", error);
        throw error;
    }
}

// Hàm để lấy dữ liệu từ Firebase bằng mã đặc biệt
async function getDataFromFirebaseById(id) {
    try {
        const response = await fetch(databaseURL + `data/${id}.json`);
        if (!response.ok) {
            throw new Error("Lỗi khi gửi yêu cầu: " + response.status);
        }
        const data = await response.json();
        console.log("Dữ liệu từ Firebase với mã đặc biệt", id + ":", data);
        return data; // Trả về dữ liệu nhận được từ Firebase
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ Firebase:", error);
        throw error;
    }
}

// Hàm callback để gán dữ liệu từ Firebase vào biến correctOrder
function onDataReceived(data) {
    correctOrder = data.name.split(""); // Gán dữ liệu name từ Firebase vào biến correctOrder
    console.log("correctOrder sau khi lấy dữ liệu từ Firebase:", correctOrder);
     // Sau khi nhận dữ liệu từ Firebase, gọi hàm hiển thị dữ liệu
     displayCorrectOrderInWordList();
}

// Lắng nghe sự kiện click trên nút
document.getElementById("submitButton").addEventListener("click", function() {
    // Gọi hàm addDataToFirebase khi người dùng nhấn nút
    addDataToFirebase().then((newId) => {
        // Sau khi thêm dữ liệu vào Firebase, lấy dữ liệu mới bằng mã đặc biệt
        getDataFromFirebaseById(newId).then(onDataReceived).catch((error) => {
            console.error("Lỗi khi lấy dữ liệu từ Firebase:", error);
        });
    }).catch((error) => {
        console.error("Lỗi khi thêm dữ liệu vào Firebase:", error);
    });
});

// Lắng nghe sự kiện click trên nút kiểm tra
document.getElementById("checkButton").addEventListener("click", function() {
    // Gọi hàm checkWord khi người dùng nhấn nút kiểm tra
    checkWords()
});

// Hàm để xáo trộn một mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// Hàm để hiển thị dữ liệu từ correctOrder vào các phần tử trong wordList và xáo trộn thứ tự hiển thị
function displayCorrectOrderInWordList() {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = ''; // Xóa bỏ các phần tử con cũ trước khi thêm phần tử mới

    // Tạo một bản sao của mảng correctOrder
    const displayOrder = correctOrder.slice();
    
    // Xáo trộn thứ tự hiển thị của mảng
    shuffleArray(displayOrder);

    // Thêm từng từ vào "wordList" theo thứ tự đã được xáo trộn
    displayOrder.forEach((character, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordDiv.draggable = true;
        wordDiv.addEventListener('dragstart', drag);
        wordDiv.textContent = character.toUpperCase(); // Chuyển đổi thành chữ in hoa
        wordDiv.id = 'word' + (index + 1); // Tạo id cho từng phần tử

        wordList.appendChild(wordDiv);
    });
}

// Lắng nghe sự kiện khi trang web được tải và hiển thị dữ liệu từ correctOrder vào wordList
document.addEventListener('DOMContentLoaded', function() {
    displayCorrectOrderInWordList();
});

//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    var dropZone = document.getElementById("dropZone");

    // Tạo một phần tử tạm thời để hiển thị trên dropZone
    var tempElement = document.createElement('div');
    tempElement.innerHTML = draggedElement.innerHTML;
    tempElement.classList.add('word', 'temp');
    dropZone.appendChild(tempElement);

    // Lấy vị trí cuối cùng của phần tử tạm thời
    var rect = tempElement.getBoundingClientRect();

    // Chuyển từ tạm thời vào vị trí cuối cùng của dropZone
    tempElement.classList.remove('temp');
    tempElement.style.position = "absolute";
    tempElement.style.left = rect.left + "px";
    tempElement.style.top = rect.top + "px";
    dropZone.appendChild(tempElement);

    // Xóa phần tử tạm thời
    tempElement.parentNode.removeChild(tempElement);

    // Thêm từ vào dropZone
    dropZone.appendChild(draggedElement);
}



// Hàm để kiểm tra thứ tự từ
function checkWords() {
    var dropZone = document.getElementById('dropZone');
    var words = dropZone.getElementsByClassName('word');

    // Chuyển tất cả các từ trong mảng correctOrder thành chữ in hoa
    var correctOrderUpper = correctOrder.map(function(word) {
        return word.toUpperCase();
    });

    var userOrder = [];
    for (var i = 0; i < words.length; i++) {
        userOrder.push(words[i].textContent.toUpperCase());
    }

    if (JSON.stringify(userOrder) === JSON.stringify(correctOrderUpper)) {
        var congratulations = document.getElementById('congratulations');
        congratulations.classList.remove('hidden');

        var gameContainer = document.getElementById('gameContainer');
        gameContainer.style.display = 'none'; // Ẩn trang chủ của trò chơi
    } else {
        alert('Thứ tự không đúng, hãy thử lại!');
        window.location.reload();
    }
}





function nextStep() {
    // Thực hiện hành động cần thiết khi người chơi nhấn nút "Đồng ý"
    window.location.href = "cuaanh.html"; // Chuyển đến trang bước tiếp theo
}

   function notnext() {
    // Hiển thị thông báo kêu bắt buộc chọn lại
    alert('Vui lòng chọn lại!');
    // Ẩn nút "Không đồng ý"
    document.getElementById('congratulations').querySelector('button:last-of-type').classList.add('hidden');
    // Hiển thị nút "Đồng ý" thứ hai
    document.getElementById('agreeButton2').classList.remove('hidden');
}

function openLetter() {
    document.getElementById('letterContent').classList.remove('hidden');
}

function closeLetter() {
    document.getElementById('letterContent').classList.add('hidden');
}

//ADMIN

// Hàm để lấy địa chỉ IP của người truy cập
async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            throw new Error('Lỗi khi lấy địa chỉ IP: ' + response.statusText);
        }
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Lỗi khi lấy địa chỉ IP:", error);
        throw error;
    }
}

// Hàm để ghi dữ liệu lên Firebase Realtime Database
async function logVisit() {
    try {
        const databaseURL = "https://xepchugame-default-rtdb.firebaseio.com/";

        // Lấy ngày và giờ hiện tại
        const timestamp = new Date().toLocaleString();

        // Lấy địa chỉ IP của người dùng
        const ipAddress = await getIPAddress();

        // Tăng số lượt truy cập lên 1 và lưu vào Firebase Realtime Database
        const response = await fetch(databaseURL + "visits.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                timestamp: timestamp,
                ipAddress: ipAddress
            })
        });
        if (!response.ok) {
            throw new Error("Lỗi khi gửi yêu cầu: " + response.status);
        }

        console.log("Dữ liệu đã được thêm vào Firebase:", { timestamp: timestamp, ipAddress: ipAddress });

    } catch (error) {
        console.error("Lỗi khi ghi dữ liệu vào Firebase:", error);
        throw error;
    }
}

// Hàm để lấy tổng số lượt truy cập
async function getTotalVisits() {
    try {
        const databaseURL = "https://xepchugame-default-rtdb.firebaseio.com/";
        const response = await fetch(databaseURL + "visits.json");
        if (!response.ok) {
            throw new Error("Lỗi khi gửi yêu cầu: " + response.status);
        }
        const data = await response.json();
        const totalVisits = Object.keys(data).length;
        console.log("Tổng số lượt truy cập:", totalVisits);
        return totalVisits;
    } catch (error) {
        console.error("Lỗi khi lấy tổng số lượt truy cập:", error);
        throw error;
    }
}

// Ghi lại lượt truy cập mỗi khi trang được tải
window.onload = async function() {
    try {
        await logVisit();
        await getTotalVisits();
    } catch (error) {
        console.error("Lỗi khi thực hiện các thao tác:", error);
    }
};

//////////////////////////////////////////////////////////////////////////////
 // gợi ý theo t/g
 let timeoutID;

        // Khai báo hàm để bắt đầu đếm thời gian
        function startTimer() {
            timeoutID = setTimeout(showHint, 90000); // 120000 milliseconds = 2 phút
        }

        // Khai báo hàm để dừng hẹn giờ
        function stopTimer() {
            clearTimeout(timeoutID);
        }

        // Hàm để hiển thị dấu chấm hỏi và gợi ý
        function showHint() {
            // Hiển thị dấu chấm hỏi
            const hintButton = document.getElementById('hintButton');
            hintButton.classList.remove('hidden');

            // Gán sự kiện click cho dấu chấm hỏi để hiển thị gợi ý
            hintButton.addEventListener('click', showHintContent);

            // Dừng hẹn giờ (nếu có)
            stopTimer();
        }

        // Hàm để hiển thị nội dung gợi ý
        function showHintContent() {
            // Hiển thị nội dung gợi ý từ biến correctOrder
            const hintContent = document.getElementById('hintContent');
            hintContent.textContent = "Gợi ý: " + correctOrder.join(', ');
            hintContent.classList.remove('hidden');

            // Ẩn dấu chấm hỏi sau khi hiển thị gợi ý
            const hintButton = document.getElementById('hintButton');
            hintButton.classList.add('hidden');
        }

        // Gọi hàm bắt đầu đếm thời gian khi trang được tải
        window.onload = startTimer;
