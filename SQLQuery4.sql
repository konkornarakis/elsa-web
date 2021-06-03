SELECT TOP 1 *
FROM [Elsa].[dbo].[Orders] o
WHERE current_status = 'CREATED' AND deliver_id IS NULL AND sender_id != '1' AND receiver_id != '1';

UPDATE [Elsa].[dbo].[Orders]
SET deliver_id = '1' , current_status = 'ASSIGNED', status_assigned = GETDATE()
WHERE id = '1';

CREATE TRIGGER add_tracking
ON [Elsa].[dbo].[Orders]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

	DECLARE @id nvarchar(50)
	SELECT @id = [id]
	FROM INSERTED
	
	DECLARE @status nvarchar(50)
	SELECT @status = [current_status]
	FROM INSERTED

	DECLARE @datetime datetime
	SELECT @datetime = [status_last]
	FROM INSERTED

	DECLARE @comment nvarchar(50)
	SELECT @comment = ''


	INSERT INTO [Elsa].[dbo].[Tracking]
	VALUES (@id, @status, @datetime, @comment)

END

-- test data etc

delete from Orders
delete from Tracking
delete from import

delete from orders where id ='43'

select * from orders
select * from Tracking
select * from import

update import set deliver_id = NULL where deliver_id = 'NULL'

insert into Orders select * from import

insert into Orders values('123', 'sql', '1', 'address', '2', 'address2', '3', '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('132', 'sql', '1', 'address', '3', 'address2', '2', '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('213', 'sql', '2', 'address', '1', 'address2', '3', '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('231', 'sql', '2', 'address', '3', 'address2', '1', '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('312', 'sql', '3', 'address', '1', 'address2', '2', '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('321', 'sql', '3', 'address', '2', 'address2', '1', '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');

insert into Orders values('12', 'sql', '1', 'address', '2', 'address2', NULL, '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('13', 'sql', '1', 'address', '3', 'address2', NULL, '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('21', 'sql', '2', 'address', '1', 'address2', NULL, '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('23', 'sql', '2', 'address', '3', 'address2', NULL, '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('31', 'sql', '3', 'address', '1', 'address2', NULL, '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');
insert into Orders values('32', 'sql', '3', 'address', '2', 'address2', NULL, '2021-06-03 16:29:56.997', 'CREATED', '2021-06-03 16:29:56.997', '0', '0');

-- telos test data