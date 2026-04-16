// Анализатор лог-файлов
class LogAnalyzer {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.resultSection = document.getElementById('resultSection');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Клик по области загрузки
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // Клик по кнопке выбора файла
        this.selectFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });
        
        // Выбор файла
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processFile(e.target.files[0]);
            }
        });
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length > 0) {
                this.processFile(e.dataTransfer.files[0]);
            }
        });
    }
    
    processFile(file) {
        // Проверка типа файла
        if (!file.name.match(/\.(log|txt|csv)$/i)) {
            this.showError('Пожалуйста, загрузите файл с расширением .log, .txt или .csv');
            return;
        }
        
        this.showError(null);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            this.analyzeLog(content);
            this.showPreview(content);
        };
        
        reader.onerror = () => {
            this.showError('Ошибка при чтении файла');
        };
        
        reader.readAsText(file, 'UTF-8');
    }
    
    analyzeLog(content) {
        // Извлекаем имена из текста
        const names = this.extractNames(content);
        
        if (names.length === 0) {
            this.showError('Не найдено имён в файле. Убедитесь, что файл содержит текстовые данные с именами.');
            return;
        }
        
        // Подсчёт частоты имён
        const frequency = this.calculateFrequency(names);
        
        // Сортировка по убыванию частоты
        const sortedNames = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1]);
        
        // Отображение результатов
        this.displayResults(sortedNames, names.length);
    }
    
    extractNames(text) {
        // Регулярное выражение для поиска имён (с заглавной буквы, кириллица или латиница)
        // Ищет слова, начинающиеся с заглавной буквы, длиной от 2 до 20 символов
        const namePattern = /\b([А-ЯЁA-Z][а-яёa-z]{1,19})\b/g;
        
        // Также ищем имена в кавычках или после ключевых слов
        const additionalPatterns = [
            /user[:\s]+(\w+)/gi,
            /name[:\s]+(\w+)/gi,
            /username[:\s]+(\w+)/gi,
            /author[:\s]+(\w+)/gi,
            /"([А-ЯЁA-Z][а-яёa-z]+)"/g,
            /'([А-ЯЁA-Z][а-яёa-z]+)'/g
        ];
        
        const matches = [];
        
        // Основной паттерн
        let match;
        while ((match = namePattern.exec(text)) !== null) {
            matches.push(match[1]);
        }
        
        // Дополнительные паттерны
        additionalPatterns.forEach(pattern => {
            while ((match = pattern.exec(text)) !== null) {
                matches.push(match[1]);
            }
        });
        
        // Фильтрация стоп-слов (слова, которые не являются именами)
        const stopWords = ['The', 'This', 'That', 'These', 'Those', 'From', 'With', 'And', 'For', 'But', 'Not', 'Are', 'Was', 'Were', 'Been', 'Can', 'Will', 'Would', 'Should', 'Could', 'May', 'Might', 'Hello', 'Error', 'Warning', 'Info', 'Debug'];
        
        return matches.filter(name => 
            name.length >= 2 && 
            !stopWords.includes(name) &&
            !name.match(/^\d+$/) // Не числа
        );
    }
    
    calculateFrequency(names) {
        const frequency = {};
        names.forEach(name => {
            frequency[name] = (frequency[name] || 0) + 1;
        });
        return frequency;
    }
    
    displayResults(sortedNames, totalEntries) {
        if (sortedNames.length === 0) {
            this.showError('Не найдено имён для анализа');
            return;
        }
        
        const topName = sortedNames[0][0];
        const topCount = sortedNames[0][1];
        const uniqueNames = sortedNames.length;
        const maxFrequency = ((topCount / totalEntries) * 100).toFixed(2);
        
        // Отображение топ-имени
        document.getElementById('topName').textContent = topName;
        document.getElementById('topCount').textContent = `${topCount} раз (${maxFrequency}%)`;
        
        // Общая статистика
        document.getElementById('totalEntries').textContent = totalEntries;
        document.getElementById('uniqueNames').textContent = uniqueNames;
        document.getElementById('maxFrequency').textContent = `${maxFrequency}%`;
        
        // Топ-10 имён
        const topList = document.getElementById('topList');
        topList.innerHTML = '';
        
        const top10 = sortedNames.slice(0, 10);
        top10.forEach(([name, count], index) => {
            const percentage = ((count / totalEntries) * 100).toFixed(1);
            const item = document.createElement('div');
            item.className = 'top-item';
            item.innerHTML = `
                <span class="top-item-rank">${index + 1}</span>
                <span class="top-item-name">${this.escapeHtml(name)}</span>
                <span class="top-item-count">${count} (${percentage}%)</span>
            `;
            topList.appendChild(item);
        });
        
        // Показать секцию результатов
        this.resultSection.style.display = 'block';
        
        // Прокрутка к результатам
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showPreview(content) {
        const preview = document.getElementById('filePreview');
        const lines = content.split('\n').slice(0, 10);
        preview.textContent = lines.join('\n');
    }
    
    showError(message) {
        const errorDiv = this.errorMessage;
        if (message) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            this.resultSection.style.display = 'none';
        } else {
            errorDiv.style.display = 'none';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new LogAnalyzer();
});