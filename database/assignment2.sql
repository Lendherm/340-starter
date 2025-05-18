-- Task 1: Insert Tony Stark into account table
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Task 2: Update Tony Stark's account_type to Admin
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = (
    SELECT account_id
    FROM public.account
    WHERE account_email = 'tony@starkent.com'
);

-- Task 3: Delete Tony Stark from account
DELETE FROM public.account
WHERE account_id = (
    SELECT account_id
    FROM public.account
    WHERE account_email = 'tony@starkent.com'
);

-- Task 4: Update GM Hummer description
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Task 5: Inner join for Sport classification
SELECT inv_make, inv_model, classification_name
FROM public.inventory
INNER JOIN public.classification
    ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';

-- Task 6: Update image paths to include '/vehicles'
UPDATE public.inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');