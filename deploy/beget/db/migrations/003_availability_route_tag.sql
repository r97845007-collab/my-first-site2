UPDATE availability SET route_tag = 'all' WHERE route_tag IS NULL OR route_tag = '';

ALTER TABLE availability
  MODIFY route_tag VARCHAR(64) NOT NULL DEFAULT 'all';
