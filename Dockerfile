COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL


RUN npm run build


# ----------- STAGE 2: PRODUCTION -----------
FROM nginx:alpine

# Elimina config default de nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia tu nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build generado
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]