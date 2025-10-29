# Backend Dockerfile for Symfony API Platform application
FROM php:8.3-fpm-alpine

# Ensure latest security patches for system packages
RUN apk update && apk upgrade --no-cache

# Install system dependencies
RUN apk add --no-cache \
    ca-certificates \
    git \
    unzip \
    curl \
    libzip-dev \
    postgresql-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    zip \
    intl \
    opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock* ./

# Install PHP dependencies
RUN composer install --no-scripts --no-autoloader --prefer-dist

# Copy application files
COPY . .

# Generate autoloader
RUN composer dump-autoload --optimize

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/var

# Expose port 9000 for PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]
