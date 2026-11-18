.PHONY: sync update

sync:
	node scripts/sync-skills.mjs

update:
	git pull --rebase
	$(MAKE) sync
