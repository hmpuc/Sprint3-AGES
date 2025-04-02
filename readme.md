Instalar:
Deletar a pasta prisma, mas salvar o schema.prisma
npm i
npx prisma init --datasource-provider sqlite --output ../generated/prisma~
npx prisma db pull
npx prisma generate