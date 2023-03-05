rm -rf output/*
yarn add rpc-gen
yarn rpc-gen
mv *.ts output/
mv package.json output/
mv yarn.lock output/
mv node_modules output/