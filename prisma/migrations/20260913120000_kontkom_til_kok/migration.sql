-- Kontkom ble slått sammen til «Kiosk og Kontor» (kok) i Photon, så slugen
-- finnes ikke lenger i gruppelista og ble vist rå i grensesnittet.
UPDATE "BookableItem" SET "groupSlug" = 'kok' WHERE "groupSlug" = 'kontkom';
UPDATE "Reservation" SET "groupSlug" = 'kok' WHERE "groupSlug" = 'kontkom';
UPDATE "FAQ" SET "groupSlug" = 'kok' WHERE "groupSlug" = 'kontkom';
