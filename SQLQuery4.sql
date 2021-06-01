SELECT TOP 1 *
FROM [Elsa].[dbo].[Orders] o
WHERE current_status = 'CREATED' AND deliver_id IS NULL AND sender_id != '1' AND receiver_id != '1';

UPDATE [Elsa].[dbo].[Orders]
SET deliver_id = '1' , current_status = 'ASSIGNED', status_assigned = GETDATE()
WHERE id = '1';