.PHONY: help dev-up dev-down dev-logs dev-shell-db prod-up prod-down prod-logs prod-restart prod-shell-db redeploy full-up full-down full-logs full-shell-db status clean seed db-snapshot db-restore

GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

help: ## Показать справку
	@echo "$(GREEN)Double B Shop - Docker команды$(NC)"
	@echo ""
	@echo "$(YELLOW)Разработка (docker-compose.yml — только БД):$(NC)"
	@echo "  dev-up          Запустить PostgreSQL для локальной разработки"
	@echo "  dev-down        Остановить БД"
	@echo "  dev-logs        Логи PostgreSQL"
	@echo "  dev-shell-db    psql в dev-контейнере"
	@echo ""
	@echo "$(YELLOW)Продакшн (docker-compose.prod.yml + web-network):$(NC)"
	@echo "  prod-up         API + Frontend + DB + migrate"
	@echo "  prod-down       Остановить prod"
	@echo "  prod-logs       Логи prod"
	@echo "  prod-restart    Перезапуск prod"
	@echo "  redeploy        git pull + prod-up"
	@echo "  prod-shell-db   psql в prod"
	@echo ""
	@echo "$(YELLOW)Полный локальный стенд (docker-compose.full.yml):$(NC)"
	@echo "  full-up         API + Frontend + DB + PgAdmin"
	@echo "  full-down       Остановить полный стенд"
	@echo "  full-logs       Логи полного стенда"
	@echo "  full-shell-db   psql в full"
	@echo ""
	@echo "$(YELLOW)Общие:$(NC)"
	@echo "  seed            Залить демо-данные (нужен запущенный api)"
	@echo "  status          Статус контейнеров"
	@echo "  clean           Удалить контейнеры и volumes"
	@echo "  db-snapshot     pg_dump в ./backup.dump"
	@echo "  db-restore      Восстановить из ./backup.dump"
	@echo ""

dev-up: ## Запустить PostgreSQL для локальной разработки
	@echo "$(GREEN)Запуск PostgreSQL...$(NC)"
	docker compose up -d db
	@echo "$(GREEN)DB: localhost:$${POSTGRES_PORT:-5432}$(NC)"

dev-down:
	@echo "$(RED)Остановка dev БД...$(NC)"
	docker compose down

dev-logs:
	docker compose logs -f db

dev-shell-db:
	docker exec -it doubleb-db psql -U $${POSTGRES_USER:-doubleb} -d $${POSTGRES_DB:-doubleb_shop}

prod-up: ## Поднять prod (нужна сеть web-network)
	@echo "$(GREEN)Запуск prod...$(NC)"
	docker network inspect web-network >/dev/null 2>&1 || docker network create web-network
	docker compose -f docker-compose.prod.yml up -d --build
	@sleep 8
	@docker compose -f docker-compose.prod.yml ps

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

prod-restart:
	docker compose -f docker-compose.prod.yml down
	docker compose -f docker-compose.prod.yml up -d --build

redeploy: ## git pull + prod-up
	@echo "$(YELLOW)Redeploy...$(NC)"
	git pull
	docker compose -f docker-compose.prod.yml up -d --build
	@echo "$(GREEN)Redeploy завершён$(NC)"

prod-shell-db:
	docker exec -it doubleb-db psql -U $${POSTGRES_USER:-doubleb} -d $${POSTGRES_DB:-doubleb_shop}

full-up:
	@echo "$(GREEN)Запуск полного стенда...$(NC)"
	docker compose -f docker-compose.full.yml up -d --build
	@echo "$(GREEN)Frontend: http://localhost:$${FRONTEND_PORT:-3000}$(NC)"
	@echo "$(GREEN)API:      http://localhost:$${API_PORT:-8000}$(NC)"
	@echo "$(GREEN)PgAdmin:  http://localhost:$${PGADMIN_PORT:-5050}$(NC)"

full-down:
	docker compose -f docker-compose.full.yml down

full-logs:
	docker compose -f docker-compose.full.yml logs -f

full-shell-db:
	docker exec -it doubleb-db psql -U $${POSTGRES_USER:-doubleb} -d $${POSTGRES_DB:-doubleb_shop}

seed:
	docker exec doubleb-api python manage.py seed_data

status:
	@echo "$(GREEN)Dev:$(NC)"; docker compose ps
	@echo "$(GREEN)Prod:$(NC)"; docker compose -f docker-compose.prod.yml ps
	@echo "$(GREEN)Full:$(NC)"; docker compose -f docker-compose.full.yml ps

clean:
	@echo "$(RED)Удаление контейнеров и volumes...$(NC)"
	docker compose down -v
	docker compose -f docker-compose.prod.yml down -v
	docker compose -f docker-compose.full.yml down -v

db-snapshot:
	docker exec doubleb-db pg_dump -U $${POSTGRES_USER:-doubleb} -d $${POSTGRES_DB:-doubleb_shop} -Fc -f /tmp/backup.dump
	docker cp doubleb-db:/tmp/backup.dump ./backup.dump
	@echo "$(GREEN)Сохранено: ./backup.dump$(NC)"

db-restore:
	docker cp ./backup.dump doubleb-db:/tmp/backup.dump
	docker exec doubleb-db pg_restore -U $${POSTGRES_USER:-doubleb} -d $${POSTGRES_DB:-doubleb_shop} --clean --if-exists /tmp/backup.dump

default: help
