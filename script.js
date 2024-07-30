// URL của Firebase Realtime Database
const databaseURL = "https://xepchugame-default-rtdb.firebaseio.com/";

let linkToFirebaseData; // Định nghĩa biến linkToFirebaseData ở phạm vi toàn cục
let correctOrder; // Định nghĩa biến correctOrder

// Hàm callback để xử lý sau khi dữ liệu được thêm vào Firebase thành công
function onDataAdded(newId, recipientName) {
    const gameLink = `${window.location.href.split('?')[0]}?id=${newId}`; // Tạo đường dẫn với mã đặc biệt
    console.log('Dữ liệu đã được thêm vào Firebase. Truy cập đường link sau để chơi trò chơi:\n' + gameLink);
    
    const linkContainer = document.getElementById('linkContainer');
    linkContainer.innerHTML = `Gửi đường link này cho ${recipientName}: <a href="${gameLink}">${gameLink}</a>`;
    linkContainer.style.display = 'block'; // Hiển thị phần tử linkContainer
}

// Ẩn phần nhập
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        const nameInput = document.getElementById('textInput');
        const submitButton = document.getElementById('submitButton');
        if (nameInput) nameInput.remove();
        if (submitButton) submitButton.remove();
    }
});

// Lắng nghe sự kiện khi trang web được tải và kiểm tra tham số truy vấn
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        getDataFromFirebaseById(id)
            .then(onDataReceived) // Gọi hàm để hiển thị danh sách từ
            .catch((error) => console.error("Lỗi khi lấy dữ liệu từ Firebase:", error));
    }
});

// Hàm để thêm dữ liệu vào Firebase
async function addDataToFirebase() {
    try {
        const nameInput = document.getElementById("textInput");
        const recipientNameInput = document.getElementById("recipientName");
        const name = nameInput.value.trim().replace(/\s+/g, ''); // Loại bỏ dấu cách từ chuỗi nhập liệu
        const recipientName = recipientNameInput.value.trim(); // Lấy tên người nhận và giữ nguyên dấu cách
        
        if (name && recipientName) {
            const response = await fetch(`${databaseURL}data.json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, recipientName })
            });
            if (!response.ok) throw new Error("Lỗi khi gửi yêu cầu: " + response.status);
            
            const responseData = await response.json();
            const newKey = responseData.name; // Lấy mã đặc biệt mới được tạo
            console.log("Dữ liệu đã được thêm vào Firebase:", { id: newKey, name, recipientName });

            onDataAdded(newKey, recipientName); // Gọi hàm xử lý sau khi dữ liệu được thêm thành công
            return newKey; // Trả về mã đặc biệt của dữ liệu mới được thêm vào Firebase
        } else {
            if (!name) {
                alert("Vui lòng nhập tên trước khi thêm dữ liệu.");
            } else if (!recipientName) {
                alert("Vui lòng nhập tên người nhận.");
            }
        }
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu vào Firebase:", error);
        throw error;
    }
}

// Hàm để lấy dữ liệu từ Firebase bằng mã đặc biệt
async function getDataFromFirebaseById(id) {
    try {
        const response = await fetch(`${databaseURL}data/${id}.json`);
        if (!response.ok) throw new Error("Lỗi khi gửi yêu cầu: " + response.status);
        
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
    
    displayCorrectOrderInWordList(); // Sau khi nhận dữ liệu từ Firebase, gọi hàm hiển thị dữ liệu
}

// Lắng nghe sự kiện click trên nút
document.getElementById("submitButton").addEventListener("click", function() {
    addDataToFirebase()
        .then(newId => getDataFromFirebaseById(newId))
        .then(onDataReceived)
        .catch(error => console.error("Lỗi khi thêm dữ liệu vào Firebase:", error));
});

// Lắng nghe sự kiện click trên nút kiểm tra
document.getElementById("checkButton").addEventListener("click", checkWords);

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

    const displayOrder = correctOrder.slice();
    shuffleArray(displayOrder);

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
document.addEventListener('DOMContentLoaded', displayCorrectOrderInWordList);

// Hàm cho phép thả đối tượng
function allowDrop(ev) {
    ev.preventDefault();
}

// Hàm để kéo đối tượng
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// Hàm để thả đối tượng
function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const dropZone = document.getElementById("dropZone");

    const tempElement = document.createElement('div');
    tempElement.innerHTML = draggedElement.innerHTML;
    tempElement.classList.add('word', 'temp');
    dropZone.appendChild(tempElement);

    const rect = tempElement.getBoundingClientRect();

    tempElement.classList.remove('temp');
    tempElement.style.position = "absolute";
    tempElement.style.left = rect.left + "px";
    tempElement.style.top = rect.top + "px";
    dropZone.appendChild(tempElement);

    tempElement.parentNode.removeChild(tempElement);

    dropZone.appendChild(draggedElement);
}

// Hàm để kiểm tra thứ tự từ
function checkWords() {
    const dropZone = document.getElementById('dropZone');
    const words = Array.from(dropZone.getElementsByClassName('word')).map(word => word.textContent.toUpperCase());
    const correctOrderUpper = correctOrder.map(word => word.toUpperCase());

    if (JSON.stringify(words) === JSON.stringify(correctOrderUpper)) {
        document.getElementById('congratulations').classList.remove('hidden');
        document.getElementById('gameContainer').style.display = 'none'; // Ẩn trang chủ của trò chơi
    } else {
        alert('Thứ tự không đúng, hãy thử lại!');
        window.location.reload();
    }
}

// Hàm để chuyển đến trang bước tiếp theo
function nextStep() {
    window.location.href = "cuaanh.html";
}

// Hàm để xử lý khi người dùng không đồng ý
function notnext() {
    const button = document.getElementById('notAgreeButton');
    button.style.position = 'absolute';
    moveButtonRandomly();
}

// Hàm để di chuyển nút ngẫu nhiên
function moveButtonRandomly() {
    const button = document.getElementById('notAgreeButton');
    const container = document.getElementById('letterContent');
    const containerRect = container.getBoundingClientRect();

    const randomX = Math.random() * (containerRect.width - button.offsetWidth);
    const randomY = Math.random() * (containerRect.height - button.offsetHeight);

    button.style.left = `${randomX}px`;
    button.style.top = `${randomY}px`;
}

// Hàm để mở nội dung thư
function openLetter() {
    document.getElementById('letterContent').classList.remove('hidden');
}

//lấy tên từ id người gửi
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Lấy mã ID từ URL

    if (id) {
        // Ẩn phần nhập tên người nhận và nhãn của nó
        const recipientNameInput = document.getElementById('recipientName');
        const recipientNameLabel = document.getElementById('recipientNameLabel');
        
        if (recipientNameInput) {
            recipientNameInput.style.display = 'none';
        }
        
        if (recipientNameLabel) {
            recipientNameLabel.style.display = 'none';
        }
    }

    if (id) {
        getDataFromFirebaseById(id)
            .then(data => {
                // Hiển thị tên người nhận sau thông báo chúc mừng
                const recipientName = data.recipientName; // Lấy tên người nhận từ dữ liệu
                const congratulationsMessage = document.getElementById('congratulationsMessage');
                congratulationsMessage.innerHTML = `Chúc mừng, ${recipientName}! Bạn đã hoàn thành xếp chữ!<br>`;
                
                // Hiển thị các từ theo thứ tự chính xác
                correctOrder = data.name.split(""); // Gán dữ liệu name từ Firebase vào biến correctOrder
                displayCorrectOrderInWordList(); // Hiển thị các từ
            })
            .catch(error => {
                console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);
            });
    }
});

// Hàm để lấy dữ liệu từ Firebase bằng mã ID
async function getDataFromFirebaseById(id) {
    try {
        const response = await fetch(`${databaseURL}data/${id}.json`);
        if (!response.ok) throw new Error('Lỗi khi gửi yêu cầu: ' + response.status);
        
        const data = await response.json();
        console.log('Dữ liệu từ Firebase với mã đặc biệt', id + ':', data);
        return data; // Trả về dữ liệu nhận được từ Firebase
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);
        throw error;
    }
}


// JavaScript để tạo nhiều trái tim liên tục và phân phối ngẫu nhiên

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.hearts-container');
    const toggleButton = document.getElementById('toggle-button');
    let heartsInterval;

    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';

        // Vị trí ngẫu nhiên từ 0 đến (100% - kích thước trái tim)
        const leftPosition = Math.random() * (window.innerWidth - 20); // 20px là kích thước của trái tim
        heart.style.left = `${leftPosition}px`;

        // Đặt thời gian và độ trễ animation ngẫu nhiên
        const fallDuration = Math.random() * 5 + 10; // 10s đến 15s (rơi chậm hơn)
        const delay = Math.random() * 5; // 0s đến 5s (độ trễ ngắn hơn)
        heart.style.animation = `fall ${fallDuration}s linear infinite`;
        heart.style.animationDelay = `${delay}s`;

        // Đặt độ mờ ngẫu nhiên
        heart.style.opacity = Math.random() * 0.5 + 0.5; // độ mờ từ 0.5 đến 1

        // Thêm trái tim vào container
        container.appendChild(heart);

        // Xóa trái tim sau khi nó hoàn thành animation để giữ cho DOM nhẹ
        heart.addEventListener('animationend', () => {
            heart.remove();
        });
    }

    function toggleHearts() {
        if (heartsInterval) {
            clearInterval(heartsInterval);
            heartsInterval = null;
            container.innerHTML = ''; // Xóa tất cả trái tim khi tắt
            toggleButton.textContent = 'Off'; // Hiển thị trạng thái Off
        } else {
            heartsInterval = setInterval(createHeart, 1000); // Tạo thêm trái tim mỗi 1000ms (ít hơn)
            // Tạo ngay một số trái tim ban đầu
            for (let i = 0; i < 5; i++) {
                createHeart(); // Giảm số trái tim ban đầu
            }
            toggleButton.textContent = 'On'; // Hiển thị trạng thái On
        }
    }

    // Gán sự kiện click cho nút toggle
    toggleButton.addEventListener('click', toggleHearts);
});
