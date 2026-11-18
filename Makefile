.PHONY: sync sync-all update

sync:
	node scripts/sync-skills.mjs

sync-all:
	node scripts/sync-skills.mjs --include-external

update:
	git pull --rebase
	$(MAKE) sync
