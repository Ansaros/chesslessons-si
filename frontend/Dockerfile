# Используем официальный Node.js образ
FROM node:18

# Рабочая директория в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости, включая devDependencies
RUN npm install --legacy-peer-deps

# Копируем остальной код проекта
COPY . .

# Собираем Next.js приложение
RUN npm run build

# Открываем порт, на котором работает Next.js
EXPOSE 3001

# Запускаем приложение
CMD ["npm", "start"]
