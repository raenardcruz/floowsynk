ui:
	@echo "Running Front End"
	cd app && @npm run dev

serve:
	@echo "Running Back End"
	@cd Server && @go run .